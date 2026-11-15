import styled from "styled-components";
import { useEffect, useMemo, useRef, useState } from "react";
import PuzzleTile from "./components/PuzzleTile";
import Header from "./components/Header";
import Tabs from "./components/Tabs";
import { Leaderboard } from "./components/AdSlot";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import {
  getBuildId,
  fetchRootPagePuzzles,
  fetchArchivePagePuzzles,
  normalizePuzzles,
  mergeUniqueById,
  filterByMode,
} from "./api/crosshare";

const PAGE_SIZE = 12; // 3 columns x 4 rows, matching the redesign

// Archive pages are numbered sequentially, so search can pull several at once
// instead of walking nextPage one round-trip at a time.
const SEARCH_BATCH = 6;
const SEARCH_DEBOUNCE_MS = 250;

const Page = styled.div`
  display: flex;
  flex-direction: column;

  background-color: #ffffff;
  width: 100%;
  min-height: 100vh;
`;

const Shell = styled.div`
  /* Page is a flex column, so a flex item with auto margins and no
     explicit width shrink-wraps to its content instead of filling. */
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 16px 48px;
  box-sizing: border-box;
`;

const Columns = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 40px;
  align-items: start;
  margin-top: 28px;

  /* Below this the rail can't sit beside a 3-up grid without crushing it, so
     it drops underneath. */
  @media (max-width: 900px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

// The grid and the pagination rule share this column so their edges line up.
const Main = styled.main`
  min-width: 0;
`;

const CrosswordGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;

  @media (max-width: 620px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 400px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const PageNavigator = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-top: 28px;
  padding-top: 10px;
  border-top: 1px solid #000000;
`;

const PageLink = styled.button`
  background: none;
  border: none;
  padding: 4px 2px;

  font-family:
    "Open Sans",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
  font-size: 13px;
  letter-spacing: 0.4px;
  color: #000000;
  text-decoration: none;

  cursor: ${(props) => (props.disabled ? "default" : "pointer")};

  /* Hiding is separate from disabling: NEXT stays visible while it's fetching
     so it can show LOADING, it just can't be clicked. */
  visibility: ${(props) => (props.$hidden ? "hidden" : "visible")};

  &:hover {
    text-decoration: ${(props) => (props.disabled ? "none" : "underline")};
  }
`;

const SearchBox = styled.input`
  display: block;
  box-sizing: border-box;
  width: 100%;
  max-width: 380px;
  margin: 0 auto 26px;
  padding: 11px 16px;

  font-family:
    "Open Sans",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
  font-size: 15px;
  color: #000000;

  background: #ffffff;
  border: 1px solid #c4c4c4;
  border-radius: 8px;

  &:focus {
    outline: none;
    border-color: #60a0e5;
    box-shadow: 0 0 0 3px rgba(96, 160, 229, 0.25);
  }
`;

const SearchNote = styled.p`
  font-family:
    "Open Sans",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
  font-size: 13px;
  color: #555555;
  text-align: center;
  margin: -14px 0 20px;
`;

const Status = styled.p`
  font-family:
    "Open Sans",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
  font-size: 14px;
  color: #555555;
  text-align: center;
  padding: 32px 0;
`;

function normalize(text) {
  return (text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// Every word has to appear somewhere in the title, constructor, or date —
// dates in both the tile's 09/20/2026 form and as "September 20 2026".
function matchesQuery(puzzle, terms) {
  const d = new Date(puzzle.pubDate);
  const dates = Number.isNaN(d.getTime())
    ? ""
    : [
        d.toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
        }),
        d.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
      ].join(" ");

  const haystack = normalize(`${puzzle.title} ${puzzle.author || ""} ${dates}`);
  return terms.every((term) => haystack.includes(term));
}

export default function XML({ mode = "all" }) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreServerPages, setHasMoreServerPages] = useState(false);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchFailed, setSearchFailed] = useState(false);

  const buildIdRef = useRef(null);
  const nextPageRef = useRef(null);
  const itemsRef = useRef([]);
  const fetchingRef = useRef(false);

  async function ensureEnoughForPage(targetPage) {
    if (fetchingRef.current) return;

    const neededCount = targetPage * PAGE_SIZE;
    let workingItems = [...itemsRef.current];

    if (filterByMode(workingItems, mode).length >= neededCount) return;
    if (!buildIdRef.current || !nextPageRef.current) return;

    fetchingRef.current = true;
    setLoadingMore(true);

    try {
      while (
        filterByMode(workingItems, mode).length < neededCount &&
        nextPageRef.current
      ) {
        const result = await fetchArchivePagePuzzles(
          buildIdRef.current,
          nextPageRef.current,
        );

        workingItems = mergeUniqueById(
          workingItems,
          normalizePuzzles(result.puzzles),
        );

        nextPageRef.current = result.nextPage;
        setHasMoreServerPages(Boolean(result.nextPage));

        itemsRef.current = workingItems;
      }

      setItems(workingItems);
    } catch (err) {
      console.error("Failed to load more puzzles:", err);
      setItems(itemsRef.current);
    } finally {
      fetchingRef.current = false;
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    // Switching tabs re-filters from scratch, so reset paging too.
    setPage(1);

    async function loadInitial() {
      try {
        setLoading(true);
        setFailed(false);

        const buildId = await getBuildId();
        buildIdRef.current = buildId;

        const first = await fetchRootPagePuzzles(buildId);
        let workingItems = mergeUniqueById([], normalizePuzzles(first.puzzles));

        nextPageRef.current = first.nextPage;
        setHasMoreServerPages(Boolean(first.nextPage));

        while (
          filterByMode(workingItems, mode).length < PAGE_SIZE &&
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
        setFailed(true);
      } finally {
        setLoading(false);
      }
    }

    loadInitial();
  }, [mode]);

  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedQuery(query.trim()),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery]);

  // A search has to see the whole archive, not just the pages paged through so
  // far. Results fill in as batches land; once everything is loaded, later
  // searches are instant.
  useEffect(() => {
    if (!debouncedQuery || loading || !nextPageRef.current) return undefined;

    let cancelled = false;
    setSearchFailed(false);

    async function loadRest() {
      // A NEXT click may be mid-fetch; let it finish rather than racing it.
      while (fetchingRef.current) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        if (cancelled) return;
      }

      fetchingRef.current = true;

      try {
        while (!cancelled && nextPageRef.current) {
          const first = nextPageRef.current;
          const pages = Array.from(
            { length: SEARCH_BATCH },
            (_, i) => first + i,
          );
          const results = await Promise.all(
            pages.map((n) => fetchArchivePagePuzzles(buildIdRef.current, n)),
          );

          let workingItems = itemsRef.current;
          let next = null;
          for (const result of results) {
            workingItems = mergeUniqueById(
              workingItems,
              normalizePuzzles(result.puzzles),
            );
            next = result.nextPage;
            if (!next) break;
          }

          nextPageRef.current = next;
          itemsRef.current = workingItems;
          setItems(workingItems);
          setHasMoreServerPages(Boolean(next));
        }
      } catch (err) {
        console.error("Failed to search the archive:", err);
        if (!cancelled) setSearchFailed(true);
      } finally {
        fetchingRef.current = false;
      }
    }

    loadRest();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, loading]);

  const gridPuzzles = useMemo(() => {
    const inMode = filterByMode(items, mode);
    const terms = normalize(debouncedQuery).split(/\s+/).filter(Boolean);
    if (!terms.length) return inMode;
    return inMode.filter((puzzle) => matchesQuery(puzzle, terms));
  }, [items, mode, debouncedQuery]);

  const searching = Boolean(debouncedQuery);
  // Driven by what's left to load, not by whether a fetch is in flight, so
  // there's no gap where an unfinished search looks finished.
  const searchingArchive = searching && hasMoreServerPages && !searchFailed;
  const resultCount = `${gridPuzzles.length} ${
    gridPuzzles.length === 1 ? "result" : "results"
  }`;

  const totalLoadedPages = Math.ceil(gridPuzzles.length / PAGE_SIZE);
  const start = (page - 1) * PAGE_SIZE;
  const currentPageItems = gridPuzzles.slice(start, start + PAGE_SIZE);

  async function handleNext() {
    const targetPage = page + 1;

    // Search results are already filtered from what's loaded; the archive
    // fetch above keeps feeding them.
    if (searching) {
      if (targetPage <= totalLoadedPages) setPage(targetPage);
      return;
    }

    await ensureEnoughForPage(targetPage);

    const availablePages = Math.ceil(
      filterByMode(itemsRef.current, mode).length / PAGE_SIZE,
    );

    if (targetPage <= availablePages) {
      setPage(targetPage);
    }
  }

  function handlePrev() {
    setPage((p) => Math.max(1, p - 1));
  }

  const canGoPrev = page > 1;
  const canGoNext =
    page < totalLoadedPages || (!searching && hasMoreServerPages);

  return (
    <Page>
      <Header />

      <Shell>
        <Leaderboard />

        <Columns>
          <Main>
            <Tabs mode={mode} />

            <SearchBox
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${mode === "mini" ? "minis" : "crosswords"} by title, constructor, or date`}
              aria-label={`Search ${mode === "mini" ? "minis" : "crosswords"}`}
            />

            {searching && !loading && !failed && (
              <SearchNote aria-live="polite">
                {searchingArchive
                  ? `${gridPuzzles.length} found so far, searching older puzzles…`
                  : searchFailed && hasMoreServerPages
                    ? `Couldn't search older puzzles. Showing ${resultCount} from recent ones.`
                    : resultCount}
              </SearchNote>
            )}

            {loading ? (
              <Status>Loading puzzles…</Status>
            ) : failed ? (
              <Status>
                We couldn't load the puzzles just now. Please try again later.
              </Status>
            ) : (
              <>
                {searching && !hasMoreServerPages && !gridPuzzles.length && (
                  <Status>No puzzles match "{debouncedQuery}".</Status>
                )}

                <CrosswordGrid>
                  {currentPageItems.map((item) => (
                    <PuzzleTile key={item.id} puzzle={item} siblings={items} />
                  ))}
                </CrosswordGrid>

                <PageNavigator>
                  <PageLink
                    onClick={handlePrev}
                    disabled={!canGoPrev}
                    $hidden={!canGoPrev}
                  >
                    PREV
                  </PageLink>

                  <PageLink
                    onClick={handleNext}
                    disabled={!canGoNext || loadingMore}
                    $hidden={!canGoNext && !loadingMore}
                  >
                    {loadingMore ? "LOADING…" : "NEXT"}
                  </PageLink>
                </PageNavigator>
              </>
            )}
          </Main>

          <Sidebar />
        </Columns>
      </Shell>

      <Footer />
    </Page>
  );
}
