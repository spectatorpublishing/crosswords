import react from "react";
import CrosswordBox from "../CrosswordBox";

const Spotlight = ({ crossword }) => {
  if (!crossword) {
    return <div>Loading latest crossword...</div>;
  }
  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "250px",
        marginBottom: "25px",
        marginLeft: "20px",
        marginRight: "20px",
        borderRadius: "10px",
        padding: "60px 40px",
      }}
    >
      <div
        style={{
          fontFamily: "Bitter, serif",
        }}
      >
        <h1>Latest Crossword</h1>
      </div>
      <div style={{ transform: "scale(1.3)" }}>
        <CrosswordBox
          title={crossword.title}
          link={crossword.link}
          pubDate={crossword.pubDate}
        />
      </div>
    </div>
  );
};

export default Spotlight;
