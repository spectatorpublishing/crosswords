import { useEffect, useState } from "react";
import CrosswordBox from "./CrosswordBox";
import Header from "./components/Header";
import Spotlight from "./components/Spotlight";

function XML() {
  const [items, setItems] = useState([]);
  const [latestCrossword, setLatestCrossword] = useState(null);
  const LIST_ID = "RNwE74wUBUW0a8bezMCE2nn7Snf2";

  useEffect(() => {
    fetch("https://corsproxy.io/?https://crosshare.org/api/feed/spectest")
      .then((res) => res.text())
      .then((xmlStr) => {
        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlStr, "application/xml");

        const parsedItems = Array.from(xml.querySelectorAll("item")).map(
          (item) => ({
            title: item.querySelector("title")?.textContent,
            link: item.querySelector("link")?.textContent,
            pubDate: item.querySelector("pubDate")?.textContent,
          }),
        );

        setItems(parsedItems);

        const sortedItems = parsedItems.sort(
          (a, b) => new Date(b.pubDate) - new Date(a.pubDate),
        );
        setLatestCrossword(sortedItems[0]);
      });
  }, []);

  return (
    <div
      style={{ backgroundColor: "#B9D9EB", width: "100%", minHeight: "100vh" }}
    >
      <Header />
      <Spotlight crossword={latestCrossword} />
      <div
        style={{
          display: "flex",
          gap: "15px",
          flexWrap: "wrap",
          alignItems: "stretch",
          marginLeft: "20px",
        }}
      >
        {items
          .filter((item) => item.link !== latestCrossword?.link)
          .map((item, i) => (
            <CrosswordBox
              key={i}
              title={item.title}
              link={item.link}
              pubDate={item.pubDate}
            />
          ))}
      </div>
    </div>
  );
}

export default XML;
