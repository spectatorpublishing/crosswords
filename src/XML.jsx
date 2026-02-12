import { useEffect, useState } from "react";
import CrosswordBox from "./CrosswordBox";

const BUILD_ID = "vyRXtEvG8s-ccCLAr5L1g";
const SLUG = "CUDailySpectator";

// CORS proxy to bypass CORS restrictions when fetching from crosshare.org

async function fetchJsonThroughCorsProxy(url) {
  const proxiedUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
  const res = await fetch(proxiedUrl, { headers: { Accept: "application/json" } });

  const text = await res.text();

  return JSON.parse(text);
}

// Fetch all puzzles with a loop, handling pagination

async function fetchAllPuzzles() {
  const base = `https://crosshare.org/_next/data/${BUILD_ID}/en/${SLUG}/page`;

  const all = [];
  let page = 1;

  while (true) {
    const url = `${base}/${page}.json?slug=${SLUG}&slug=page&slug=${page}`;

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

    fetchAllPuzzles()
      .then((puzzles) => {
        const parsedItems = puzzles.map((p) => ({
          id: p.id,
          title: p.title,
          pubDate: new Date(p.publishTime).toISOString(),
          isMini: (p.autoTags || []).includes("mini"),
        }));
        setItems(parsedItems);
      })

  }, []);

  const shown =
  mode === "mini"
    ? items.filter((x) => x.isMini)
    : mode === "full"
    ? items.filter((x) => !x.isMini)
    : items;

  return (
    <div>
      <h2>Crosshare Puzzles</h2>

      <div>
        Number of puzzles: {shown.length}
      </div>

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
        {shown.map((item, i) => (
          <CrosswordBox key={item.id} title={item.title} link={`https://crosshare.org/crosswords/${item.id}`} pubDate={item.pubDate} />
        ))}
      </div>
    </div>
  );
}
