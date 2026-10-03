import styled from "styled-components";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
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

// Holds HOME and PREV together on the left, so NEXT keeps the right edge.
const NavGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
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

export default function XML({ mode = "all" }) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreServerPages, setHasMoreServerPages] = useState(false);
  const [failed, setFailed] = useState(false);

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

  const gridPuzzles = useMemo(() => filterByMode(items, mode), [items, mode]);

  const totalLoadedPages = Math.ceil(gridPuzzles.length / PAGE_SIZE);
  const start = (page - 1) * PAGE_SIZE;
  const currentPageItems = gridPuzzles.slice(start, start + PAGE_SIZE);

  async function handleNext() {
    const targetPage = page + 1;

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
  const canGoNext = page < totalLoadedPages || hasMoreServerPages;

  return (
    <Page>
      <Header />

      <Shell>
        <Leaderboard />

        <Columns>
          <Main>
            <Tabs mode={mode} />

            {loading ? (
              <Status>Loading puzzles…</Status>
            ) : failed ? (
              <Status>
                We couldn't load the puzzles just now. Please try again later.
              </Status>
            ) : (
              <>
                <CrosswordGrid>
                  {currentPageItems.map((item) => (
                    <PuzzleTile key={item.id} puzzle={item} siblings={items} />
                  ))}
                </CrosswordGrid>

                <PageNavigator>
                  <NavGroup>
                    <PageLink as={Link} to="/">
                      HOME
                    </PageLink>

                    <PageLink
                      onClick={handlePrev}
                      disabled={!canGoPrev}
                      $hidden={!canGoPrev}
                    >
                      PREV
                    </PageLink>
                  </NavGroup>

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
