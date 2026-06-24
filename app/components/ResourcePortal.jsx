"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "";

const categories = [
  "All",
  "Artificial Intelligence",
  "Machine Learning",
  "Deep Learning",
  "Python",
  "Projects",
  "Interview Prep",
];

const levels = ["All", "Beginner", "Intermediate", "Advanced"];
const fileTypes = ["All", "PDF", "PPTX", "PPT", "DOCX", "XLSX", "ZIP"];

function apiUrl(path) {
  return `${API_BASE_URL}${path}`;
}

function downloadUrl(resource) {
  if (!resource.downloadUrl || resource.downloadUrl === "#") {
    return "#";
  }

  return resource.downloadUrl.startsWith("http")
    ? resource.downloadUrl
    : apiUrl(resource.downloadUrl);
}

function formatBytes(bytes) {
  if (!bytes) return "Ready soon";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / 1024 ** index;
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

function byNewest(a, b) {
  return Date.parse(b.createdAt) - Date.parse(a.createdAt);
}

export default function ResourcePortal({ initialResources }) {
  const [resources, setResources] = useState(initialResources);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState("All");
  const [fileType, setFileType] = useState("All");
  const [uploadStatus, setUploadStatus] = useState({
    state: "idle",
    message: "",
  });
  const formRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    fetch(apiUrl("/api/resources"))
      .then((response) => response.json())
      .then((payload) => {
        if (isMounted && payload.resources?.length) {
          setResources(payload.resources);
        }
      })
      .catch(() => {
        if (isMounted) {
          setResources(initialResources);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [initialResources]);

  const filteredResources = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return resources
      .filter((resource) => {
        const matchesSearch = normalizedQuery
          ? `${resource.title} ${resource.description} ${resource.category}`
              .toLowerCase()
              .includes(normalizedQuery)
          : true;
        const matchesCategory = category === "All" || resource.category === category;
        const matchesLevel = level === "All" || resource.level === level;
        const matchesType = fileType === "All" || resource.fileType === fileType;
        return matchesSearch && matchesCategory && matchesLevel && matchesType;
      })
      .sort(byNewest);
  }, [category, fileType, level, query, resources]);

  async function handleUpload(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setUploadStatus({ state: "loading", message: "Uploading material..." });

    try {
      const response = await fetch(apiUrl("/api/resources"), {
        method: "POST",
        body: formData,
      });
      const payload = await response.json();

      if (!response.ok || !payload.resource) {
        throw new Error(payload.error ?? "Upload failed.");
      }

      setResources((current) => [payload.resource, ...current]);
      setUploadStatus({
        state: "success",
        message: "Material uploaded through the Python backend.",
      });
      form.reset();
    } catch (error) {
      setUploadStatus({
        state: "error",
        message:
          error instanceof Error
            ? error.message
            : "Upload failed. Check that the Python backend is running.",
      });
    }
  }

  return (
    <>
      <section id="materials" className="bg-[#f8faf9] px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase text-[#0f766e]">
                Study Library
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-[#18201f] sm:text-4xl">
                Clean notes, slides, and practice files for serious learners.
              </h2>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center sm:min-w-[420px]">
              <div className="rounded-lg border border-[#dbe7e2] bg-white p-4">
                <strong className="block text-2xl text-[#0f766e]">
                  {resources.length}
                </strong>
                <span className="text-xs font-medium text-[#65736f]">Materials</span>
              </div>
              <div className="rounded-lg border border-[#dbe7e2] bg-white p-4">
                <strong className="block text-2xl text-[#d95f42]">4</strong>
                <span className="text-xs font-medium text-[#65736f]">Paths</span>
              </div>
              <div className="rounded-lg border border-[#dbe7e2] bg-white p-4">
                <strong className="block text-2xl text-[#b7791f]">50MB</strong>
                <span className="text-xs font-medium text-[#65736f]">Upload</span>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-3 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#35413e]">Search</span>
              <input
                className="focus-ring h-12 w-full rounded-lg border border-[#cfdcd7] bg-white px-4 text-sm text-[#18201f]"
                placeholder="Neural networks, Python, projects"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#35413e]">Category</span>
              <select
                className="focus-ring h-12 w-full rounded-lg border border-[#cfdcd7] bg-white px-4 text-sm text-[#18201f]"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                {categories.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#35413e]">Level</span>
              <select
                className="focus-ring h-12 w-full rounded-lg border border-[#cfdcd7] bg-white px-4 text-sm text-[#18201f]"
                value={level}
                onChange={(event) => setLevel(event.target.value)}
              >
                {levels.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#35413e]">File</span>
              <select
                className="focus-ring h-12 w-full rounded-lg border border-[#cfdcd7] bg-white px-4 text-sm text-[#18201f]"
                value={fileType}
                onChange={(event) => setFileType(event.target.value)}
              >
                {fileTypes.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredResources.map((resource) => (
              <article
                className="rounded-lg border border-[#dbe7e2] bg-white p-5 shadow-sm"
                key={resource.id}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase text-[#0f766e]">
                      {resource.category}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold text-[#18201f]">
                      {resource.title}
                    </h3>
                  </div>
                  <span className="rounded-md bg-[#ffe6d9] px-3 py-1 text-xs font-bold text-[#9f341d]">
                    {resource.fileType}
                  </span>
                </div>
                <p className="mt-4 min-h-16 text-sm leading-6 text-[#56635f]">
                  {resource.description}
                </p>
                <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-[#4a5754]">
                  <span className="rounded-md bg-[#e7f6f2] px-3 py-1">
                    {resource.level}
                  </span>
                  <span className="rounded-md bg-[#fff4d8] px-3 py-1">
                    {formatBytes(resource.fileSize)}
                  </span>
                </div>
                {downloadUrl(resource) === "#" ? (
                  <button
                    className="mt-5 h-11 w-full rounded-lg border border-[#cfdcd7] bg-[#f8faf9] text-sm font-bold text-[#65736f]"
                    disabled
                    type="button"
                  >
                    Upload file to enable
                  </button>
                ) : (
                  <a
                    className="focus-ring mt-5 flex h-11 items-center justify-center rounded-lg bg-[#0f766e] text-sm font-bold text-white transition hover:bg-[#0b5e58]"
                    href={downloadUrl(resource)}
                  >
                    Download
                  </a>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="upload" className="bg-white px-5 py-16 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase text-[#d95f42]">
              Creator Desk
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-[#18201f] sm:text-4xl">
              Publish PDFs and PPTs from the Python backend.
            </h2>
            <p className="mt-5 text-base leading-7 text-[#56635f]">
              Add a title, choose a topic, attach the file, and the Python API
              stores it locally with searchable SQLite metadata.
            </p>
            <div className="mt-8 grid gap-3 text-sm font-semibold text-[#35413e]">
              <div className="rounded-lg border border-[#dbe7e2] bg-[#f8faf9] p-4">
                Accepts PDF, PPT, PPTX, DOCX, XLSX, and ZIP files.
              </div>
              <div className="rounded-lg border border-[#dbe7e2] bg-[#f8faf9] p-4">
                Uses an admin key so visitors cannot publish files.
              </div>
            </div>
          </div>

          <form
            className="rounded-lg border border-[#dbe7e2] bg-[#f8faf9] p-5 sm:p-6"
            onSubmit={handleUpload}
            ref={formRef}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-[#35413e]">Title</span>
                <input
                  className="focus-ring h-12 w-full rounded-lg border border-[#cfdcd7] bg-white px-4 text-sm text-[#18201f]"
                  name="title"
                  placeholder="Linear Regression Complete Notes"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#35413e]">Category</span>
                <select
                  className="focus-ring h-12 w-full rounded-lg border border-[#cfdcd7] bg-white px-4 text-sm text-[#18201f]"
                  name="category"
                >
                  {categories.slice(1).map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#35413e]">Level</span>
                <select
                  className="focus-ring h-12 w-full rounded-lg border border-[#cfdcd7] bg-white px-4 text-sm text-[#18201f]"
                  name="level"
                >
                  {levels.slice(1).map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-[#35413e]">
                  Short Description
                </span>
                <textarea
                  className="focus-ring min-h-28 w-full rounded-lg border border-[#cfdcd7] bg-white px-4 py-3 text-sm text-[#18201f]"
                  name="description"
                  placeholder="What followers will learn from this material"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#35413e]">File</span>
                <input
                  accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.zip"
                  className="focus-ring flex h-12 w-full items-center rounded-lg border border-[#cfdcd7] bg-white px-3 py-2 text-sm text-[#18201f]"
                  name="file"
                  required
                  type="file"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#35413e]">
                  Admin Key
                </span>
                <input
                  className="focus-ring h-12 w-full rounded-lg border border-[#cfdcd7] bg-white px-4 text-sm text-[#18201f]"
                  name="adminKey"
                  required
                  type="password"
                />
              </label>
            </div>
            <button
              className="focus-ring mt-5 h-12 w-full rounded-lg bg-[#d95f42] text-sm font-bold text-white transition hover:bg-[#b94b32] disabled:cursor-not-allowed disabled:bg-[#c7d2cc]"
              disabled={uploadStatus.state === "loading"}
              type="submit"
            >
              {uploadStatus.state === "loading" ? "Uploading..." : "Publish Material"}
            </button>
            {uploadStatus.message ? (
              <p
                className={`mt-4 rounded-lg px-4 py-3 text-sm font-semibold ${
                  uploadStatus.state === "error"
                    ? "bg-[#ffe6d9] text-[#9f341d]"
                    : "bg-[#e7f6f2] text-[#0f766e]"
                }`}
              >
                {uploadStatus.message}
              </p>
            ) : null}
          </form>
        </div>
      </section>
    </>
  );
}
