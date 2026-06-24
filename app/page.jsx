import Image from "next/image";
import ResourcePortal from "./components/ResourcePortal";

const sampleResources = [
  {
    id: "sample-ml-roadmap",
    title: "Machine Learning Roadmap",
    description:
      "A structured path covering Python basics, statistics, model training, evaluation, and project practice.",
    category: "Machine Learning",
    level: "Beginner",
    fileType: "PDF",
    fileName: "ml-roadmap.pdf",
    fileSize: 0,
    createdAt: "2026-06-16T00:00:00.000Z",
    downloadUrl: "#",
  },
  {
    id: "sample-ai-tools",
    title: "AI Tools Starter Slides",
    description:
      "A short deck for explaining prompt design, automation workflows, model limits, and practical tool selection.",
    category: "Artificial Intelligence",
    level: "Beginner",
    fileType: "PPTX",
    fileName: "ai-tools-starter.pptx",
    fileSize: 0,
    createdAt: "2026-06-15T00:00:00.000Z",
    downloadUrl: "#",
  },
  {
    id: "sample-projects",
    title: "Portfolio Project Checklist",
    description:
      "Project ideas and evaluation checkpoints for classification, forecasting, computer vision, and NLP demos.",
    category: "Projects",
    level: "Intermediate",
    fileType: "PDF",
    fileName: "portfolio-project-checklist.pdf",
    fileSize: 0,
    createdAt: "2026-06-14T00:00:00.000Z",
    downloadUrl: "#",
  },
];

const videoSeries = [
  [
    "60-sec ML",
    "Short explainers for regression, classification, clustering, and model metrics.",
  ],
  [
    "Python Lab",
    "Notebook-style practice videos with clean examples and downloadable files.",
  ],
  [
    "AI Tools",
    "Practical workflows for prompting, research, automation, and study planning.",
  ],
  [
    "Interview Prep",
    "Concept refreshers, common questions, and project explanation practice.",
  ],
];

const roadmap = [
  ["Week 1", "Python, NumPy, Pandas, and data cleaning essentials."],
  ["Week 2", "Statistics, visualization, train/test split, and model evaluation."],
  ["Week 3", "Supervised ML projects with regression and classification."],
  ["Week 4", "Deep learning basics, deployment ideas, and portfolio polish."],
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f8faf9] text-[#18201f]">
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/15 bg-[#0d201e]/88 px-5 py-3 text-white backdrop-blur sm:px-8">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <a className="text-base font-bold" href="#top">
            AI/ML Study Hub
          </a>
          <div className="hidden items-center gap-5 text-sm font-semibold md:flex">
            <a className="hover:text-[#ffb199]" href="#materials">
              Materials
            </a>
            <a className="hover:text-[#ffb199]" href="#upload">
              Upload
            </a>
            <a className="hover:text-[#ffb199]" href="#videos">
              Videos
            </a>
            <a className="hover:text-[#ffb199]" href="#roadmap">
              Roadmap
            </a>
          </div>
          <a
            className="focus-ring rounded-lg bg-[#ffb199] px-4 py-2 text-sm font-bold text-[#18201f] hover:bg-[#ffd1c4]"
            href="https://www.instagram.com/"
          >
            Instagram
          </a>
        </nav>
      </header>

      <section
        className="hero-cover flex min-h-[78svh] items-center px-5 pb-12 pt-28 text-white sm:px-8"
        id="top"
      >
        <div className="mx-auto grid w-full max-w-7xl items-center gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="max-w-3xl">
            <p className="inline-flex rounded-md bg-white/14 px-3 py-2 text-sm font-bold text-[#9ff1e7] ring-1 ring-white/20">
              AI videos, study files, and learner roadmaps
            </p>
            <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-[1.05] sm:text-6xl lg:text-7xl">
              AI/ML Study Hub
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#e7fffb] sm:text-xl">
              A focused website for your Instagram community to find PDFs,
              PPTs, practice files, video topics, and step-by-step learning
              paths in one place.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                className="focus-ring flex h-12 items-center justify-center rounded-lg bg-[#ffb199] px-6 text-sm font-bold text-[#18201f] hover:bg-[#ffd1c4]"
                href="#materials"
              >
                Browse Materials
              </a>
              <a
                className="focus-ring flex h-12 items-center justify-center rounded-lg border border-white/40 px-6 text-sm font-bold text-white hover:bg-white/10"
                href="#upload"
              >
                Creator Upload
              </a>
            </div>
          </div>

          <aside className="profile-card justify-self-center lg:justify-self-end">
            <Image
              alt="G. Arun Mozhi"
              className="profile-photo"
              height={340}
              priority
              src="/arun-mozhi-profile.png"
              unoptimized
              width={340}
            />
            <div className="profile-caption">
              <h2>G. ARUN MOZHI</h2>
              <p>AI/ML Engineer</p>
            </div>
          </aside>
        </div>
      </section>

      <section className="border-b border-[#dbe7e2] bg-white px-5 py-6 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-[#e7f6f2] p-5">
            <p className="text-sm font-semibold text-[#0f766e]">For followers</p>
            <strong className="mt-2 block text-2xl text-[#18201f]">
              Downloadable notes
            </strong>
          </div>
          <div className="rounded-lg bg-[#fff4d8] p-5">
            <p className="text-sm font-semibold text-[#8a5a00]">For videos</p>
            <strong className="mt-2 block text-2xl text-[#18201f]">
              Topic series
            </strong>
          </div>
          <div className="rounded-lg bg-[#ffe6d9] p-5">
            <p className="text-sm font-semibold text-[#9f341d]">For you</p>
            <strong className="mt-2 block text-2xl text-[#18201f]">
              Python uploads
            </strong>
          </div>
        </div>
      </section>

      <ResourcePortal initialResources={sampleResources} />

      <section id="videos" className="bg-[#102421] px-5 py-16 text-white sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase text-[#ffb199]">
              Instagram Video Plan
            </p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
              A content system that connects every reel to a resource.
            </h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {videoSeries.map(([title, description]) => (
              <article
                className="rounded-lg border border-white/14 bg-white/8 p-5"
                key={title}
              >
                <h3 className="text-xl font-semibold text-[#9ff1e7]">{title}</h3>
                <p className="mt-4 text-sm leading-6 text-[#d7efeb]">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="roadmap" className="bg-[#f8faf9] px-5 py-16 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase text-[#0f766e]">
              Learning Roadmap
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-[#18201f] sm:text-4xl">
              Turn followers into repeat learners.
            </h2>
            <p className="mt-5 text-base leading-7 text-[#56635f]">
              Each week can have a reel series, a downloadable PDF, and a short
              practice task so learners know what to do next.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {roadmap.map(([week, detail]) => (
              <article
                className="rounded-lg border border-[#dbe7e2] bg-white p-5"
                key={week}
              >
                <p className="text-sm font-bold text-[#d95f42]">{week}</p>
                <h3 className="mt-2 text-lg font-semibold text-[#18201f]">
                  {detail}
                </h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-white px-5 py-10 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 border-t border-[#dbe7e2] pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <strong className="text-lg text-[#18201f]">AI/ML Study Hub</strong>
            <p className="mt-1 text-sm text-[#65736f]">
              Built for AI and ML learners from your Instagram community.
            </p>
          </div>
          <a className="text-sm font-bold text-[#0f766e]" href="mailto:hello@example.com">
            Contact
          </a>
        </div>
      </footer>
    </main>
  );
}
