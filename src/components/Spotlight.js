import CrosswordBox from "../CrosswordBox";
import styled from "styled-components";

const SpotlightContainer = styled.div`
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(32px, 12vw, 250px);
  margin: 0 20px 25px;
  border-radius: 10px;
  padding: 60px 40px;

  @media (max-width: 860px) {
    flex-direction: column;
    gap: 22px;
    margin: 0 16px 24px;
    padding: 28px 16px;
    text-align: center;
  }
`;

const SpotlightTitle = styled.div`
  font-family: "Bitter", serif;
`;

const SpotlightCard = styled.div`
  zoom: 1.3;

  @media (max-width: 860px) {
    zoom: 1;
    display: grid;
    place-items: center;
    width: 100%;
  }
`;

const Spotlight = ({ crossword }) => {
  if (!crossword) {
    return <div>Loading latest crossword...</div>;
  }
  return (
    <SpotlightContainer>
      <SpotlightTitle>
        <h1>Latest Crossword</h1>
      </SpotlightTitle>
      <SpotlightCard>
        <CrosswordBox
          title={crossword.title}
          link={crossword.link}
          pubDate={crossword.pubDate}
        />
      </SpotlightCard>
    </SpotlightContainer>
  );
};

export default Spotlight;
