import { useEffect, useState } from "react";
import styled from "styled-components";
import CrosswordBox from "./CrosswordBox";
import Header from "./components/Header";
import Spotlight from "./components/Spotlight";

const SLUG = "CUDailySpectator";

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
  });
  const text = await res.text();
  return JSON.parse(text);
}

// get current build ID
async function getBuildId() {
  const pageUrl = `https://crosshare.org/${SLUG}?page=0`;
  const proxied = `https://corsproxy.io/?${encodeURIComponent(pageUrl)}`;

  const res = await fetch(proxied);
  const html = await res.text();

  const match = html.match(/"buildId":"(.*?)"/);

  if (!match) {
    throw new Error("Could not find buildId in page HTML");
  }

  return match[1];
}

async function fetchAllPuzzles() {
  const buildId = await getBuildId();
  const all = [];
  let page = 0;

  while (true) {
    const url = `https://crosshare.org/_next/data/${buildId}/en/${SLUG}/page/${page}.json`;
    const data = await fetchJsonThroughCorsProxy(url);
    const puzzles = data?.pageProps?.puzzles ?? [];
    all.push(...puzzles);

    const nextPage = data?.pageProps?.nextPage;
    if (!nextPage) break;
    page = nextPage;
  }

  return all;
}

export default function XML({ mode = "all" }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    async function loadPuzzles() {
      try {
        const puzzles = await fetchAllPuzzles();
        const parsedItems = puzzles.map((p) => ({
          id: p.id,
          title: p.title,
          link: `https://crosshare.org/crosswords/${p.id}`,
          pubDate: new Date(p.publishTime).toISOString(),
          isMini: (p.autoTags || []).includes("mini"),
        }));

        setItems(parsedItems);
      } catch (err) {
        console.error("Failed to fetch puzzles:", err);
      }
    }

    loadPuzzles();
  }, []);

  const latestCrossword = items
    .filter((x) => !x.isMini)
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))[0];

  const latestMini = items
    .filter((x) => x.isMini)
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))[0];

  const shown =
    mode === "mini"
      ? items.filter((x) => x.isMini)
      : mode === "full"
        ? items.filter((x) => !x.isMini)
        : items;

  return (
    <Page>
      <Header />
      {latestCrossword && (
        <Spotlight crossword={mode === "full" ? latestCrossword : latestMini} />
      )}

      {/* <div>Number of puzzles: {shown.length}</div> */}

      <CrosswordGridWrap>
        <CrosswordGrid>
          {shown
            .filter((item) => item.id !== latestCrossword?.id)
            .filter((item) => item.id !== latestMini?.id)
            .map((item) => (
              <CrosswordBox
                key={item.id}
                title={item.title}
                link={item.link}
                pubDate={item.pubDate}
              />
            ))}
        </CrosswordGrid>
      </CrosswordGridWrap>
    </Page>
  );
}
