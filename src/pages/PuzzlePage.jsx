import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import styled from "styled-components";
import Header from "../components/Header";
import PuzzleTile from "../components/PuzzleTile";
import { Leaderboard } from "../components/AdSlot";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import {
  embedUrl,
  fetchPuzzleWithSiblings,
  filterByMode,
} from "../api/crosshare";

const RELATED_COUNT = 6;

const MULTIMEDIA_URL = "https://www.columbiaspectator.com/multimedia/";

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
  padding: 0 16px 56px;
  box-sizing: border-box;
`;

const Columns = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 40px;
  align-items: start;
  margin-top: 28px;

  @media (max-width: 900px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const Main = styled.main`
  min-width: 0;
`;

const Breadcrumb = styled.div`
  font-family:
    "Open Sans",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: #000000;
  margin-bottom: 6px;

  a {
    color: inherit;
    text-decoration: none;
  }
  a:hover {
    text-decoration: underline;
  }
`;

const Title = styled.h1`
  font-family: "Merriweather", "Bitter", Georgia, serif;
  font-weight: 700;
  font-size: 26px;
  line-height: 1.25;
  margin: 0 0 6px;
`;

const Byline = styled.div`
  font-family:
    "Open Sans",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: #000000;
  margin-bottom: 14px;
`;

const BylineDate = styled.span`
  color: #60a0e5;
`;

const EmbedFrame = styled.iframe`
  display: block;
  width: 100%;
  height: min(80vh, 720px);
  min-height: 520px;
  border: none;
  background: #1a1a1a;
`;

const RelatedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
  margin-top: 28px;

  @media (max-width: 620px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 400px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const SeeAllRow = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 28px;
`;

const SeeAllButton = styled(Link)`
  display: inline-block;
  padding: 11px 26px;

  font-family: "Merriweather", "Bitter", Georgia, serif;
  font-weight: 700;
  font-size: 15px;
  text-decoration: none;
  color: #ffffff;

  background: #000000;
  border-radius: 999px;

  &:hover {
    background: #262626;
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
  padding: 48px 0;
`;

function formatBylineDate(pubDate) {
  if (!pubDate) return "";
  const d = new Date(pubDate);
  if (Number.isNaN(d.getTime())) return "";
  return d
    .toLocaleDateString("en-US", { month: "long", day: "numeric" })
    .toUpperCase();
}

// The most recent puzzles in this category, newest first, with the current one
// left wherever its date puts it. Switching puzzles then moves only the
// highlight.
function pickRelated(puzzle, all) {
  if (!puzzle || !all) return [];

  return filterByMode(all, puzzle.isMini ? "mini" : "full").slice(
    0,
    RELATED_COUNT,
  );
}

export default function PuzzlePage() {
  const { id } = useParams();
  const { state: locationState } = useLocation();

  const [puzzle, setPuzzle] = useState(null);
  const [allPuzzles, setAllPuzzles] = useState([]);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tiles are clicked from halfway down a scrolled archive page, so without
  // this the reader lands mid-embed on the new one.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    let cancelled = false;

    // A tile click hands over the puzzle and the list it was rendered from, so
    // the common case needs no network round-trip. Cold loads (shared link,
    // refresh) arrive with no state and fall through to the fetch.
    const handoff = locationState?.puzzle?.id === id ? locationState : null;
    const handoffAll = handoff?.all || [];
    const handoffRelated = pickRelated(handoff?.puzzle, handoffAll);

    if (handoff) {
      setPuzzle(handoff.puzzle);
      setAllPuzzles(handoffAll);
      setRelated(handoffRelated);
      setLoading(false);

      // Enough came along to fill the row — nothing left to fetch.
      if (handoffRelated.length >= RELATED_COUNT) return undefined;
    } else {
      setPuzzle(null);
      setAllPuzzles([]);
      setRelated([]);
      setLoading(true);
    }

    async function load() {
      try {
        const { puzzle: found, all } = await fetchPuzzleWithSiblings(id);
        if (cancelled) return;

        // Only overwrite on success. A handoff may already be showing this
        // puzzle, and the lookup gives up after a page cap — so a miss here
        // doesn't mean the puzzle doesn't exist, and shouldn't replace a good
        // render with the not-found state.
        if (found) {
          setPuzzle(found);
          setAllPuzzles(all);
          setRelated(pickRelated(found, all));
        }
      } catch (err) {
        console.error("Failed to load puzzle:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id, locationState]);

  if (loading) {
    return (
      <Page>
        <Header />
        <Shell>
          <Status>Loading puzzle…</Status>
        </Shell>

        <Footer />
      </Page>
    );
  }

  if (!puzzle) {
    return (
      <Page>
        <Header />
        <Shell>
          <Status>
            We couldn't find that puzzle.{" "}
            <Link to="/crosswords">Back to all crosswords</Link>
          </Status>
        </Shell>

        <Footer />
      </Page>
    );
  }

  const listPath = puzzle.isMini ? "/minis" : "/crosswords";

  return (
    <Page>
      <Header />

      <Shell>
        <Leaderboard />

        <Columns>
          <Main>
            <Breadcrumb>
              <a href={MULTIMEDIA_URL}>Multimedia</a> |{" "}
              <Link to="/">Games</Link> |{" "}
              <Link to={listPath}>
                {puzzle.isMini ? "Minis" : "Crosswords"}
              </Link>
            </Breadcrumb>

            <Title>{puzzle.title}</Title>

            <Byline>
              {puzzle.author ? `By ${puzzle.author} ` : ""}
              <BylineDate>
                {puzzle.author ? "• " : ""}
                {formatBylineDate(puzzle.pubDate)}
              </BylineDate>
            </Byline>

            <EmbedFrame
              src={embedUrl(puzzle.id)}
              title={puzzle.title}
              allowFullScreen
            />

            <RelatedGrid>
              {related.map((item) => (
                <PuzzleTile
                  key={item.id}
                  puzzle={item}
                  siblings={allPuzzles}
                  variant={item.id === puzzle.id ? "selected" : "default"}
                />
              ))}
            </RelatedGrid>

            <SeeAllRow>
              <SeeAllButton to={listPath}>
                See all {puzzle.isMini ? "Minis" : "Crosswords"}
              </SeeAllButton>
            </SeeAllRow>
          </Main>

          <Sidebar withLinks />
        </Columns>
      </Shell>

      <Footer />
    </Page>
  );
}
