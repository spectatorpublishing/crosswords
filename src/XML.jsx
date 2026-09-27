import styled from "styled-components";
import { useEffect, useMemo, useState } from "react";
import CrosswordBox from "./CrosswordBox";
import Header from "./components/Header";
import Spotlight from "./components/Spotlight";

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

const PageNavigator = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 30px;
  padding-bottom: 40px;
`;

const BackButton = styled.button`
  font-size: 15px;
  padding: 4px 10px;
  cursor: ${(props) => (props.canGoPrev ? "pointer" : "default")};
  opacity: ${(props) => (props.canGoPrev ? 1 : 0.4)};
`;

const PageNumber = styled.span`
  font-size: 20px;
  font-weight: 700;
  font-family: "Bitter", serif;
  color: #1d4ed8;
  letter-spacing: 0.5px;
`;

const ForwardButton = styled.button`
  font-size: 15px;
  padding: 4px 10px;
  cursor: ${(props) => (props.canGoNext ? "pointer" : "default")};
  opacity: ${(props) => (props.canGoNext ? 1 : 0.4)};
`;

// built by scripts/fetch-crosshare-data.mjs before every deploy
const PUZZLES_URL = `${process.env.PUBLIC_URL}/crosshare-puzzles.json`;

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
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadPuzzles() {
      try {
        const res = await fetch(PUZZLES_URL);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status} for ${PUZZLES_URL}`);
        }

        const data = await res.json();
        setItems(data.puzzles ?? []);
      } catch (err) {
        console.error("Failed to load puzzles:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadPuzzles();
  }, []);

  const spotlightItem = useMemo(
    () => getSpotlightItem(items, mode),
    [items, mode],
  );

  const gridPuzzles = useMemo(() => getGridPuzzles(items, mode), [items, mode]);

  const totalPages = Math.ceil(gridPuzzles.length / PAGE_SIZE);
  const start = (page - 1) * PAGE_SIZE;
  const currentPageItems = gridPuzzles.slice(start, start + PAGE_SIZE);

  function handleNext() {
    setPage((p) => Math.min(totalPages, p + 1));
  }

  function handlePrev() {
    setPage((p) => Math.max(1, p - 1));
  }

  const canGoPrev = page > 1;
  const canGoNext = page < totalPages;

  return (
    <Page>
      <Header mode={mode} />

      {spotlightItem && <Spotlight crossword={spotlightItem} />}

      {loading && (
        <div style={{ textAlign: "center", marginTop: 20 }}>Loading...</div>
      )}

      {error && (
        <div style={{ textAlign: "center", marginTop: 20 }}>
          Couldn't load puzzles. Please try again later.
        </div>
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
        <PageNavigator>
          <BackButton
            onClick={handlePrev}
            disabled={!canGoPrev}
            canGoPrev={canGoPrev}
          >
            ←
          </BackButton>

          <PageNumber>Page {page}</PageNumber>

          <ForwardButton
            onClick={handleNext}
            disabled={!canGoNext}
            canGoNext={canGoNext}
          >
            →
          </ForwardButton>
        </PageNavigator>
      )}
    </Page>
  );
}
