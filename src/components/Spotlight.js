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
        flexDirection: "column",
        alignItems: "center",
        marginBottom: "25px",
        marginLeft: "20px",
        marginRight: "20px",
        borderRadius: "10px",
      }}
    >
      <div
        style={{
          marginBottom: "25px",
          padding: "15px 20px",
          display: "flex",
          alignItems: "center",
          gap: "15px",
          fontFamily: "Bitter, serif",
          marginLeft: "20px",
          marginRight: "20px",
          borderRadius: "8px",
        }}
      >
        <h1>Latest Crossword</h1>
      </div>
      <div
        style={{
          marginBottom: "25px",
          padding: "15px 20px",
        }}
      >
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
