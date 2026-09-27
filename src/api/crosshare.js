// Crosshare has no public API, so this reads the Next.js page-data JSON behind
// crosshare.org through a CORS proxy. buildId changes on every deploy.

const SLUG = "CUDailySpectator";
const PROXY = "https://spec-crosswords-api.liondinecu.workers.dev/?";
const LIST_ID = "VrpqDMgLzHOLOGWBtAmbA5zdV0s2";

async function fetchJsonThroughCorsProxy(url) {
  const res = await fetch(`${PROXY}${encodeURIComponent(url)}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }

  return JSON.parse(await res.text());
}

// same idea as above, but for raw HTML/text
async function fetchTextThroughCorsProxy(url) {
  const res = await fetch(`${PROXY}${encodeURIComponent(url)}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }

  return res.text();
}

export async function getBuildId() {
  const html = await fetchTextThroughCorsProxy(`https://crosshare.org/${SLUG}`);
  const match = html.match(/"buildId":"(.*?)"/);

  if (!match) {
    throw new Error("Could not find buildId");
  }

  return match[1];
}

// root page = most recent puzzles
export async function fetchRootPagePuzzles(buildId) {
  const data = await fetchJsonThroughCorsProxy(
    `https://crosshare.org/_next/data/${buildId}/en/${SLUG}.json`,
  );

  return {
    puzzles: data?.pageProps?.puzzles ?? [],
    nextPage: data?.pageProps?.nextPage ?? null,
  };
}

export async function fetchArchivePagePuzzles(buildId, page) {
  const data = await fetchJsonThroughCorsProxy(
    `https://crosshare.org/_next/data/${buildId}/en/${SLUG}/page/${page}.json`,
  );

  return {
    puzzles: data?.pageProps?.puzzles ?? [],
    nextPage: data?.pageProps?.nextPage ?? null,
  };
}

export function normalizePuzzles(puzzles) {
  return puzzles.map((p) => ({
    id: p.id,
    title: p.title,
    // authorName is always "Columbia Daily Spectator", so it isn't a byline.
    author: p.guestConstructor || null,
    link: `https://crosshare.org/crosswords/${p.id}`,
    pubDate: new Date(p.publishTime).toISOString(),
    isMini: (p.autoTags || []).includes("mini"),
  }));
}

// merge new puzzles into existing ones without duplicates, then keep everything sorted newest to oldest
export function mergeUniqueById(existing, incoming) {
  const map = new Map();

  [...existing, ...incoming].forEach((item) => {
    map.set(item.id, item);
  });

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.pubDate) - new Date(a.pubDate),
  );
}

export function filterByMode(list, mode) {
  if (mode === "mini") return list.filter((x) => x.isMini);
  if (mode === "full") return list.filter((x) => !x.isMini);
  return list;
}

export function embedUrl(id) {
  return id ? `https://crosshare.org/embed/${id}/${LIST_ID}` : null;
}

// Minis dominate the feed, so `fulls` is what usually forces extra fetches.
export async function fetchLatestPuzzles({
  minis = 1,
  fulls = 2,
  maxPages = 8,
} = {}) {
  const buildId = await getBuildId();

  const first = await fetchRootPagePuzzles(buildId);
  let all = mergeUniqueById([], normalizePuzzles(first.puzzles));
  let nextPage = first.nextPage;
  let pagesFetched = 0;

  const enough = () =>
    filterByMode(all, "mini").length >= minis &&
    filterByMode(all, "full").length >= fulls;

  while (!enough() && nextPage && pagesFetched < maxPages) {
    const result = await fetchArchivePagePuzzles(buildId, nextPage);
    all = mergeUniqueById(all, normalizePuzzles(result.puzzles));
    nextPage = result.nextPage;
    pagesFetched += 1;
  }

  return all;
}

// Finding the puzzle isn't enough to stop — a full crossword usually lands on
// a page with no other fulls, leaving the related row short.
export async function fetchPuzzleWithSiblings(
  id,
  { minSameCategory = 6, maxPages = 8 } = {},
) {
  const buildId = await getBuildId();

  const first = await fetchRootPagePuzzles(buildId);
  let all = mergeUniqueById([], normalizePuzzles(first.puzzles));
  let nextPage = first.nextPage;
  let pagesFetched = 0;

  const findTarget = () => all.find((p) => p.id === id) || null;

  // Counts the target too — it occupies a slot in the related row.
  const sameCategoryCount = () => {
    const target = findTarget();
    if (!target) return 0;
    return filterByMode(all, target.isMini ? "mini" : "full").length;
  };

  while (
    (!findTarget() || sameCategoryCount() < minSameCategory) &&
    nextPage &&
    pagesFetched < maxPages
  ) {
    const result = await fetchArchivePagePuzzles(buildId, nextPage);
    all = mergeUniqueById(all, normalizePuzzles(result.puzzles));
    nextPage = result.nextPage;
    pagesFetched += 1;
  }

  return { puzzle: findTarget(), all };
}
