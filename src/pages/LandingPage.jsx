import { useEffect, useState } from "react";
import styled from "styled-components";
import Header from "../components/Header";
import PuzzleTile from "../components/PuzzleTile";
import GameCard from "../components/GameCard";
import Footer from "../components/Footer";
import { Leaderboard, HorizontalBox } from "../components/AdSlot";
import { fetchLatestPuzzles, filterByMode } from "../api/crosshare";

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
  padding: 0 16px;
  box-sizing: border-box;
`;

// The newest-releases band runs edge to edge; its contents stay in the shell.
const Band = styled.section`
  background: #d3e3f8;
  padding: 34px 0 40px;
  margin-top: 28px;
`;

const Section = styled.section`
  padding: 34px 0 40px;
`;

const Heading = styled.h2`
  font-family:
    "Open Sans",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
  font-weight: 700;
  font-size: 21px;
  text-align: center;
  margin: 0 0 24px;
`;

const Row = styled.div`
  display: flex;
  justify-content: center;
  align-items: stretch;
  flex-wrap: wrap;
  gap: 24px;
`;

// Tiles are fixed-width in the mockup rather than a fluid grid, so the row
// stays centered however many there are.
const TileSlot = styled.div`
  width: 100%;
  max-width: 200px;
`;

const AdRow = styled.div`
  display: flex;
  justify-content: center;
  padding-bottom: 48px;
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
  margin: 0;
`;

export default function LandingPage() {
  const [puzzles, setPuzzles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const all = await fetchLatestPuzzles({ minis: 1, fulls: 2 });
        if (!cancelled) setPuzzles(all);
      } catch (err) {
        console.error("Failed to load puzzles:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const minis = filterByMode(puzzles, "mini");
  const fulls = filterByMode(puzzles, "full");

  // Newest mini first, then the two newest crosswords
  const newest = [minis[0], fulls[0], fulls[1]].filter(Boolean);

  return (
    <Page>
      <Header />

      <Shell>
        <Leaderboard />
      </Shell>

      <Band>
        <Shell>
          <Heading>Play our newest releases</Heading>

          {loading ? (
            <Status>Loading puzzles…</Status>
          ) : (
            <Row>
              {newest.map((puzzle) => (
                <TileSlot key={puzzle.id}>
                  <PuzzleTile puzzle={puzzle} siblings={puzzles} />
                </TileSlot>
              ))}
            </Row>
          )}
        </Shell>
      </Band>

      <Section>
        <Shell>
          <Heading>Browse more games</Heading>

          <Row>
            <GameCard
              label="Minis"
              tint="teal"
              playTo={minis[0] ? `/puzzle/${minis[0].id}` : null}
              pastTo="/minis"
              pastLabel="Past Minis"
            />

            <GameCard
              label="Crosswords"
              tint="lightBlue"
              playTo={fulls[0] ? `/puzzle/${fulls[0].id}` : null}
              pastTo="/crosswords"
              pastLabel="Past Puzzles"
            />
          </Row>
        </Shell>
      </Section>

      <AdRow>
        <HorizontalBox />
      </AdRow>

      <Footer />
    </Page>
  );
}
