import { useEffect, useState } from "react";
import CrosswordBox from "./CrosswordBox";
import Header from "./components/Header";
import Spotlight from "./components/Spotlight";

const SLUG = "CUDailySpectator";

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
  const pageUrl = `https://crosshare.org/${SLUG}?page=1`;
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
  let page = 1;

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
  const [latestCrossword, setLatestCrossword] = useState(null);

  useEffect(() => {
    async function loadPuzzles() {
      try {
        const puzzles = await fetchAllPuzzles();
        const parsedItems = puzzles.map((p) => ({
          id: p.id,
          title: p.title,
          pubDate: new Date(p.publishTime).toISOString(),
          isMini: (p.autoTags || []).includes("mini"),
        }));

        setItems(parsedItems);

        // Find latest crossword
        const sortedItems = [...parsedItems].sort(
          (a, b) => new Date(b.pubDate) - new Date(a.pubDate),
        );
        setLatestCrossword(sortedItems[0] || null);
      } catch (err) {
        console.error("Failed to fetch puzzles:", err);
      }
    }

    loadPuzzles();
  }, []);

  const shown =
    mode === "mini"
      ? items.filter((x) => x.isMini)
      : mode === "full"
        ? items.filter((x) => !x.isMini)
        : items;

  return (
    <div
      style={{ backgroundColor: "#B9D9EB", width: "100%", minHeight: "100vh" }}
    >
      <Header />
      {latestCrossword && <Spotlight crossword={latestCrossword} />}

      <h2>Crosshare Puzzles</h2>
      <div>Number of puzzles: {shown.length}</div>

      <div
        style={{
          display: "flex",
          gap: "15px",
          flexWrap: "wrap",
          alignItems: "stretch",
          marginLeft: "20px",
          marginTop: 10,
        }}
      >
        {shown.map((item) => (
          <CrosswordBox
            key={item.id}
            title={item.title}
            link={`https://crosshare.org/crosswords/${item.id}`}
            pubDate={item.pubDate}
          />
        ))}
      </div>
    </div>
  );
}
