import styled from "styled-components";
import { useEffect, useMemo, useRef, useState } from "react";
import CrosswordBox from "./CrosswordBox";
import Header from "./components/Header";
import Spotlight from "./components/Spotlight";

const SLUG = "CUDailySpectator";
const PAGE_SIZE = 20; // to show 20 items per page, change this to change the amt of puzzles per page

const Page = styled.div`
  background-color: #b9d9eb;
  width: 100%;
  min-height: 100vh;
`;

const CrosswordGridWrap = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 10px;
  align-items: center;
  padding: 0 16px 32px;
  box-sizing: border-box;
`;

const CrosswordGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 220px));
  justify-content: center;
  justify-items: center;
  gap: 30px;
  width: 100%;
  align-items: center;

  @media (max-width: 640px) {
    grid-template-columns: minmax(0, 320px);
  }
`;

async function fetchJsonThroughCorsProxy(url) {
  const proxiedUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
  const res = await fetch(proxiedUrl, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }

  const text = await res.text();
  return JSON.parse(text);
}

// same idea as above, but for raw HTML/text
async function fetchTextThroughCorsProxy(url) {
  const proxiedUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
  const res = await fetch(proxiedUrl, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }

  return res.text();
}

async function getBuildId() {
  const html = await fetchTextThroughCorsProxy(`https://crosshare.org/${SLUG}`);
  const match = html.match(/"buildId":"(.*?)"/);

  if (!match) {
    throw new Error("Could not find buildId");
  }

  return match[1];
}

// root page = most recent puzzles
async function fetchRootPagePuzzles(buildId) {
  const url = `https://crosshare.org/_next/data/${buildId}/en/${SLUG}.json`;
  const data = await fetchJsonThroughCorsProxy(url);

  return {
    puzzles: data?.pageProps?.puzzles ?? [],
    nextPage: data?.pageProps?.nextPage ?? null,
  };
}

async function fetchArchivePagePuzzles(buildId, page) {
  const url = `https://crosshare.org/_next/data/${buildId}/en/${SLUG}/page/${page}.json`;
  const data = await fetchJsonThroughCorsProxy(url);

  return {
    puzzles: data?.pageProps?.puzzles ?? [],
    nextPage: data?.pageProps?.nextPage ?? null,
  };
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

// merge new puzzles into existing ones without duplicates, then keep everything sorted newest to oldest
function mergeUniqueById(existing, incoming) {
  const map = new Map();

  [...existing, ...incoming].forEach((item) => {
    map.set(item.id, item);
  });

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.pubDate) - new Date(a.pubDate),
  );
}

function getSpotlightItem(list, mode) {
  if (mode === "mini") {
    return list.find((x) => x.isMini) || null;
  }

  if (mode === "full") {
    return list.find((x) => !x.isMini) || null;
  }

  return list.find((x) => !x.isMini) || list[0] || null;
}

function getGridPuzzles(list, mode) {
  const spotlight = getSpotlightItem(list, mode);

  const filtered =
    mode === "mini"
      ? list.filter((x) => x.isMini)
      : mode === "full"
        ? list.filter((x) => !x.isMini)
        : list;

  return filtered.filter((x) => x.id !== spotlight?.id);
}

export default function XML({ mode = "all" }) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreServerPages, setHasMoreServerPages] = useState(false);

  const buildIdRef = useRef(null);
  const nextPageRef = useRef(null);
  const itemsRef = useRef([]);
  const fetchingRef = useRef(false);

  async function ensureEnoughForPage(targetPage) {
    if (fetchingRef.current) return;

    const neededCount = targetPage * PAGE_SIZE;
    let workingItems = [...itemsRef.current];

    if (getGridPuzzles(workingItems, mode).length >= neededCount) return;
    if (!buildIdRef.current || !nextPageRef.current) return;

    fetchingRef.current = true;
    setLoadingMore(true);

    try {
      while (
        getGridPuzzles(workingItems, mode).length < neededCount &&
        nextPageRef.current
      ) {
        const result = await fetchArchivePagePuzzles(
          buildIdRef.current,
          nextPageRef.current,
        );

        const normalized = normalizePuzzles(result.puzzles);
        workingItems = mergeUniqueById(workingItems, normalized);

        nextPageRef.current = result.nextPage;
        setHasMoreServerPages(Boolean(result.nextPage));
      }

      itemsRef.current = workingItems;
      setItems(workingItems);
    } finally {
      fetchingRef.current = false;
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    async function loadInitial() {
      try {
        setLoading(true);

        const buildId = await getBuildId();
        buildIdRef.current = buildId;

        const first = await fetchRootPagePuzzles(buildId);
        let workingItems = mergeUniqueById([], normalizePuzzles(first.puzzles));

        nextPageRef.current = first.nextPage;
        setHasMoreServerPages(Boolean(first.nextPage));

        while (
          getGridPuzzles(workingItems, mode).length < PAGE_SIZE &&
          nextPageRef.current
        ) {
          const result = await fetchArchivePagePuzzles(
            buildId,
            nextPageRef.current,
          );

          workingItems = mergeUniqueById(
            workingItems,
            normalizePuzzles(result.puzzles),
          );

          nextPageRef.current = result.nextPage;
          setHasMoreServerPages(Boolean(result.nextPage));
        }

        itemsRef.current = workingItems;
        setItems(workingItems);
      } catch (err) {
        console.error("Failed to load puzzles:", err);
      } finally {
        setLoading(false);
      }
    }

    loadInitial();
  }, [mode]);

  const spotlightItem = useMemo(
    () => getSpotlightItem(items, mode),
    [items, mode],
  );

  const gridPuzzles = useMemo(() => getGridPuzzles(items, mode), [items, mode]);

  const totalLoadedPages = Math.ceil(gridPuzzles.length / PAGE_SIZE);
  const start = (page - 1) * PAGE_SIZE;
  const currentPageItems = gridPuzzles.slice(start, start + PAGE_SIZE);

  async function handleNext() {
    const targetPage = page + 1;

    await ensureEnoughForPage(targetPage);

    const availablePages = Math.ceil(
      getGridPuzzles(itemsRef.current, mode).length / PAGE_SIZE,
    );

    if (targetPage <= availablePages) {
      setPage(targetPage);
    }
  }

  function handlePrev() {
    setPage((p) => Math.max(1, p - 1));
  }

  const canGoPrev = page > 1;
  const canGoNext = page < totalLoadedPages || hasMoreServerPages;

  return (
    <Page>
      <Header mode={mode} />

      {spotlightItem && <Spotlight crossword={spotlightItem} />}

      {loading && (
        <div style={{ textAlign: "center", marginTop: 20 }}>Loading...</div>
      )}

      <CrosswordGridWrap>
        <CrosswordGrid>
          {currentPageItems.map((item) => (
            <CrosswordBox
              key={item.id}
              title={item.title}
              link={item.link}
              pubDate={item.pubDate}
            />
          ))}
        </CrosswordGrid>
      </CrosswordGridWrap>

      {!loading && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "16px",
            marginTop: "30px",
            paddingBottom: "40px",
          }}
        >
          <button
            onClick={handlePrev}
            disabled={!canGoPrev}
            style={{
              fontSize: "15px",
              padding: "4px 10px",
              cursor: canGoPrev ? "pointer" : "default",
              opacity: canGoPrev ? 1 : 0.4,
            }}
          >
            ←
          </button>

          <span
            style={{
              fontSize: "20px",
              fontWeight: 700,
              fontFamily: "Bitter, serif",
              color: "#1d4ed8",
              letterSpacing: "0.5px",
            }}
          >
            Page {page}
          </span>

          <button
            onClick={handleNext}
            disabled={!canGoNext || loadingMore}
            style={{
              fontSize: "15px",
              padding: "4px 10px",
              cursor: canGoNext && !loadingMore ? "pointer" : "default",
              opacity: canGoNext && !loadingMore ? 1 : 0.4,
            }}
          >
            →
          </button>
        </div>
      )}
    </Page>
  );
}
