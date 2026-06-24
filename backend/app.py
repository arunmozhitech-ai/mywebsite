from __future__ import annotations

import json
import mimetypes
import os
import re
import shutil
import sqlite3
import uuid
from datetime import datetime, timezone
from email import policy
from email.parser import BytesParser
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse


BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
UPLOAD_DIR = BASE_DIR / "uploads"
DB_PATH = DATA_DIR / "materials.sqlite3"
HOST = os.environ.get("PY_BACKEND_HOST", "0.0.0.0")
PORT = int(os.environ.get("PY_BACKEND_PORT", "8000"))
ADMIN_UPLOAD_KEY = os.environ.get("ADMIN_UPLOAD_KEY", "change-this-before-deploying")
MAX_FILE_SIZE = 50 * 1024 * 1024
ALLOWED_EXTENSIONS = {"pdf", "ppt", "pptx", "doc", "docx", "xls", "xlsx", "zip"}


def ensure_storage() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(DB_PATH) as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS resources (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                category TEXT NOT NULL,
                level TEXT NOT NULL,
                file_type TEXT NOT NULL,
                file_name TEXT NOT NULL,
                file_size INTEGER NOT NULL,
                object_key TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'published',
                created_at TEXT NOT NULL
            )
            """
        )


def db_rows() -> list[dict]:
    ensure_storage()
    with sqlite3.connect(DB_PATH) as connection:
        connection.row_factory = sqlite3.Row
        rows = connection.execute(
            """
            SELECT id, title, description, category, level, file_type, file_name,
                   file_size, object_key, status, created_at
            FROM resources
            ORDER BY created_at DESC
            LIMIT 100
            """
        ).fetchall()
    return [dict(row) for row in rows]


def public_resource(row: dict) -> dict:
    return {
        "id": row["id"],
        "title": row["title"],
        "description": row["description"],
        "category": row["category"],
        "level": row["level"],
        "fileType": row["file_type"],
        "fileName": row["file_name"],
        "fileSize": row["file_size"],
        "createdAt": row["created_at"],
        "downloadUrl": f"/api/resources/download?id={row['id']}",
    }


def safe_file_name(file_name: str) -> str:
    cleaned = re.sub(r"[^a-zA-Z0-9._-]+", "-", file_name).strip("-")
    return cleaned[:120] or "material"


def extension_for(file_name: str) -> str:
    suffix = Path(file_name).suffix.lower().lstrip(".")
    return suffix


def parse_multipart(headers, body: bytes) -> tuple[dict[str, str], dict[str, dict]]:
    content_type = headers.get("Content-Type", "")
    parser_input = (
        f"Content-Type: {content_type}\r\nMIME-Version: 1.0\r\n\r\n".encode()
        + body
    )
    message = BytesParser(policy=policy.default).parsebytes(parser_input)
    fields: dict[str, str] = {}
    files: dict[str, dict] = {}

    if not message.is_multipart():
        return fields, files

    for part in message.iter_parts():
        disposition = part.get("Content-Disposition", "")
        if "form-data" not in disposition:
            continue
        params = dict(part.get_params(header="content-disposition") or [])
        name = params.get("name")
        if not name:
            continue
        filename = params.get("filename")
        payload = part.get_payload(decode=True) or b""
        if filename:
            files[name] = {
                "file_name": filename,
                "content_type": part.get_content_type(),
                "content": payload,
            }
        else:
            fields[name] = payload.decode(part.get_content_charset() or "utf-8").strip()

    return fields, files


class StudyHubHandler(BaseHTTPRequestHandler):
    server_version = "AIStudyHubPython/1.0"

    def end_headers(self) -> None:
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def do_OPTIONS(self) -> None:
        self.send_response(HTTPStatus.NO_CONTENT)
        self.end_headers()

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path == "/api/health":
            self.send_json({"ok": True, "service": "python-backend"})
            return
        if parsed.path == "/api/resources":
            self.send_json({"resources": [public_resource(row) for row in db_rows()]})
            return
        if parsed.path == "/api/resources/download":
            self.handle_download(parsed.query)
            return
        self.send_json({"error": "Not found"}, HTTPStatus.NOT_FOUND)

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path != "/api/resources":
            self.send_json({"error": "Not found"}, HTTPStatus.NOT_FOUND)
            return
        self.handle_upload()

    def handle_upload(self) -> None:
        content_length = int(self.headers.get("Content-Length", "0"))
        if content_length <= 0:
            self.send_json({"error": "No upload body received."}, HTTPStatus.BAD_REQUEST)
            return
        if content_length > MAX_FILE_SIZE + 20000:
            self.send_json({"error": "File size must be 50 MB or less."}, HTTPStatus.BAD_REQUEST)
            return

        fields, files = parse_multipart(self.headers, self.rfile.read(content_length))
        if fields.get("adminKey") != ADMIN_UPLOAD_KEY:
            self.send_json({"error": "Invalid upload key."}, HTTPStatus.UNAUTHORIZED)
            return

        uploaded = files.get("file")
        if not uploaded or not uploaded["content"]:
            self.send_json({"error": "Choose a file to upload."}, HTTPStatus.BAD_REQUEST)
            return

        original_name = uploaded["file_name"]
        extension = extension_for(original_name)
        if extension not in ALLOWED_EXTENSIONS:
            self.send_json(
                {"error": "Allowed files: PDF, PPT, PPTX, DOC, DOCX, XLS, XLSX, ZIP."},
                HTTPStatus.BAD_REQUEST,
            )
            return

        title = fields.get("title", "").strip()
        if not title:
            self.send_json({"error": "Title is required."}, HTTPStatus.BAD_REQUEST)
            return

        ensure_storage()
        resource_id = str(uuid.uuid4())
        file_name = safe_file_name(original_name)
        object_key = f"{resource_id}-{file_name}"
        target = UPLOAD_DIR / object_key
        target.write_bytes(uploaded["content"])
        created_at = datetime.now(timezone.utc).isoformat()

        row = {
            "id": resource_id,
            "title": title,
            "description": fields.get("description", "").strip(),
            "category": fields.get("category", "Machine Learning").strip() or "Machine Learning",
            "level": fields.get("level", "Beginner").strip() or "Beginner",
            "file_type": extension.upper(),
            "file_name": file_name,
            "file_size": len(uploaded["content"]),
            "object_key": object_key,
            "status": "published",
            "created_at": created_at,
        }
        with sqlite3.connect(DB_PATH) as connection:
            connection.execute(
                """
                INSERT INTO resources (
                    id, title, description, category, level, file_type, file_name,
                    file_size, object_key, status, created_at
                )
                VALUES (
                    :id, :title, :description, :category, :level, :file_type,
                    :file_name, :file_size, :object_key, :status, :created_at
                )
                """,
                row,
            )

        self.send_json({"resource": public_resource(row)}, HTTPStatus.CREATED)

    def handle_download(self, query: str) -> None:
        resource_id = parse_qs(query).get("id", [""])[0]
        if not resource_id:
            self.send_json({"error": "Resource id is required."}, HTTPStatus.BAD_REQUEST)
            return

        ensure_storage()
        with sqlite3.connect(DB_PATH) as connection:
            connection.row_factory = sqlite3.Row
            row = connection.execute(
                "SELECT * FROM resources WHERE id = ? LIMIT 1", (resource_id,)
            ).fetchone()

        if not row:
            self.send_json({"error": "Resource not found."}, HTTPStatus.NOT_FOUND)
            return

        file_path = UPLOAD_DIR / row["object_key"]
        if not file_path.exists():
            self.send_json({"error": "Uploaded file is missing."}, HTTPStatus.NOT_FOUND)
            return

        content_type = mimetypes.guess_type(row["file_name"])[0] or "application/octet-stream"
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(file_path.stat().st_size))
        self.send_header(
            "Content-Disposition", f'attachment; filename="{row["file_name"]}"'
        )
        self.end_headers()
        with file_path.open("rb") as stream:
            shutil.copyfileobj(stream, self.wfile)

    def send_json(self, payload: dict, status: HTTPStatus = HTTPStatus.OK) -> None:
        data = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def log_message(self, format: str, *args) -> None:
        print(f"[python-backend] {self.address_string()} - {format % args}")


if __name__ == "__main__":
    ensure_storage()
    server = ThreadingHTTPServer((HOST, PORT), StudyHubHandler)
    print(f"Python backend running at http://{HOST}:{PORT}")
    print(f"Upload admin key: {ADMIN_UPLOAD_KEY}")
    server.serve_forever()
