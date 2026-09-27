import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SLUG = "CUDailySpectator";
// safety cap so a bad nextPage value can never loop forever
const MAX_PAGES = 1000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const outputPath = path.join(repoRoot, "public", "crosshare-puzzles.json");

async function fetchText(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }

  return res.text();
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }

  return res.json();
}

function normalizePuzzles(puzzles) {
  return puzzles.map((p) => ({
    id: p.id,
    title: p.title,
    link: `https://crosshare.org/crosswords/${p.id}`,
    pubDate: new Date(p.publishTime).toISOString(),
    isMini: (p.autoTags || []).includes("mini"),
  }));
}

function mergeUniqueById(existing, incoming) {
  const map = new Map();

  [...existing, ...incoming].forEach((item) => {
    map.set(item.id, item);
  });

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.pubDate) - new Date(a.pubDate),
  );
}

async function getBuildId() {
  const html = await fetchText(`https://crosshare.org/${SLUG}`);
  const match = html.match(/"buildId":"(.*?)"/);

  if (!match) {
    throw new Error("Could not find buildId in Crosshare HTML");
  }

  return match[1];
}

async function fetchRootPagePuzzles(buildId) {
  const url = `https://crosshare.org/_next/data/${buildId}/en/${SLUG}.json`;
  const data = await fetchJson(url);

  return {
    puzzles: data?.pageProps?.puzzles ?? [],
    nextPage: data?.pageProps?.nextPage ?? null,
  };
}

async function fetchArchivePagePuzzles(buildId, page) {
  const url = `https://crosshare.org/_next/data/${buildId}/en/${SLUG}/page/${page}.json`;
  const data = await fetchJson(url);

  return {
    puzzles: data?.pageProps?.puzzles ?? [],
    nextPage: data?.pageProps?.nextPage ?? null,
  };
}

async function buildPuzzleList() {
  const buildId = await getBuildId();
  const first = await fetchRootPagePuzzles(buildId);

  let combined = mergeUniqueById([], normalizePuzzles(first.puzzles));
  let nextPage = first.nextPage;
  let pageCount = 1;

  while (nextPage && pageCount < MAX_PAGES) {
    const pageResult = await fetchArchivePagePuzzles(buildId, nextPage);
    combined = mergeUniqueById(combined, normalizePuzzles(pageResult.puzzles));
    nextPage = pageResult.nextPage;
    pageCount += 1;
  }

  if (combined.length === 0) {
    throw new Error("Crosshare returned no puzzles");
  }

  return {
    generatedAt: new Date().toISOString(),
    slug: SLUG,
    totalPuzzles: combined.length,
    puzzles: combined,
  };
}

async function readExistingOutput() {
  try {
    const content = await readFile(outputPath, "utf8");
    JSON.parse(content);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const hasExisting = await readExistingOutput();

  try {
    const payload = await buildPuzzleList();
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
    console.log(`Wrote ${payload.totalPuzzles} puzzles to ${outputPath}`);
  } catch (error) {
    if (hasExisting) {
      console.warn(
        `Failed to refresh Crosshare data; using existing ${outputPath}.`,
      );
      console.warn(error instanceof Error ? error.message : String(error));
      return;
    }

    throw error;
  }
}

main().catch((error) => {
  console.error("Crosshare data fetch failed:");
  console.error(error instanceof Error ? error.stack : String(error));
  process.exit(1);
});
