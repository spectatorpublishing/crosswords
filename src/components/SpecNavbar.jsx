/* Ported from Fusion's CDSBlackNavbar. Diverges in three places, on purpose:
   links are absolute (relative ones 404 off the main domain), width is
   measured on mount as well as resize, and search terms are encoded. */
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faSearch,
  faAngleDown,
  faAngleUp,
} from "@fortawesome/free-solid-svg-icons";
import { sections } from "../data/sections";

const SPEC_BASE = "https://www.columbiaspectator.com";

// The handful of GlobalStyles theme values this component actually used.
const white = "#FFFFFF";
const lightBlue = "#60B3FB";
const MOBILE = 768;

export const NAVBAR_HEIGHT = "4rem";

const absolute = (path) => `${SPEC_BASE}${path}`;

const Wrapper = styled.div`
  color: ${white};
  width: 100%;

  a {
    text-decoration: none;
    color: ${white};
  }
`;

const Bar = styled.div`
  background-color: #000000;
  width: 100%;
  height: ${NAVBAR_HEIGHT};
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  z-index: 10;
`;

const BarContainer = styled.div`
  width: 100%;
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const IconWrapper = styled.span`
  margin-right: -2.5rem;
  z-index: 10;
`;

const slideRight = keyframes`
  from { transform: translate(0, 0); }
  to { transform: translate(100%, 0); }
`;

const slideLeft = keyframes`
  from { transform: translate(100%, 0); }
  to { transform: translate(0, 0); }
`;

const SideBarContainer = styled.div`
  background-color: rgba(0, 0, 0, 0.9);
  width: 100vw;
  height: 100%;
  position: fixed;
  left: -100vw;
  top: ${NAVBAR_HEIGHT};
  overflow: scroll;
  animation: ${({ $animation }) => $animation} 0.2s ease-in forwards;
  z-index: 10;
  padding: 1rem 0.5rem;

  a {
    text-decoration: none;
    color: ${white};
    font-family: "Bitter", serif;
  }

  @media only screen and (min-width: 992px) {
    width: 20vw;
    left: -20vw;
  }
`;

const LogoContainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  margin: 0 auto;

  @media only screen and (max-width: ${MOBILE}px) {
    flex: 4;
  }
`;

const Logo = styled.img`
  height: 1.5rem;
  z-index: 10;
  display: block;
  margin: 0 auto;
`;

const HamburgerWrapper = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-start;
  background-color: transparent;
`;

const Hamburger = styled.button`
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  margin-left: 2vw;
  color: ${white};
  border-color: transparent;
  transition: 0.3s;
  background-color: transparent;
`;

const LinkContainer = styled.div`
  font-family: sans-serif;
  font-size: 1.2em;
  text-align: center;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  flex-direction: row;
  flex: 1;

  @media only screen and (max-width: ${MOBILE}px) {
    font-size: 2em;
  }
`;

const Input = styled.input`
  display: flex;
  width: 9rem;
  font-family: inherit;
  font-size: 0.7em;
  height: 1.75rem;
  background-color: rgba(0, 0, 0, 0);
  color: ${white};
  background-image: url("https://cdn-icons-png.flaticon.com/512/49/49116.png");
  background-repeat: no-repeat;
  background-position-x: 9px;
  background-position-y: center;
  background-size: 0.8rem;
  border: solid 1px #ccc;
  padding: 9px 10px 9px 28px;
  border-radius: 0.5em;
  z-index: 1;
  margin: 0 1rem;

  @media only screen and (max-width: ${MOBILE}px) {
    width: 7rem;
    height: 2rem;
    padding: 9px 10px;
    font-size: 1rem;
    margin: 0 0.5rem;
  }

  transition: box-shadow 200ms ease-in-out;
  &:hover {
    box-shadow: 0 0 0 0.2rem #01a2ff71;
  }
  &:focus {
    outline: 0;
    box-shadow: 0 0 0 0.2rem #01a2ffbe;
  }
`;

const MobileSearchButton = styled.button`
  background-color: rgba(0, 0, 0, 0);
  border: none;
  margin-right: 2vw;
  cursor: pointer;
`;

const SectionButton = styled.div`
  color: ${white};
  font-size: 1.25rem;
  font-weight: 600;
  padding: 0.5rem 1.5rem;

  &:hover {
    color: ${lightBlue};
    font-weight: 800;
  }
`;

const DropDownList = styled.div`
  width: 100%;
  margin: 0.2rem 0 0;
  padding: 0;
  overflow-y: scroll;

  a {
    color: ${white};
    text-decoration: none;
  }
`;

const LittleLink = styled.div`
  font-size: 1rem;
  font-family: "Bitter", serif;
  padding: 0.2rem 0 0.2rem 2rem;

  @media only screen and (max-width: ${MOBILE}px) {
    font-size: 1.3em;
  }

  &:hover {
    color: ${lightBlue};
    font-weight: bold;
  }
`;

const Toggle = styled.div`
  margin: auto 2rem auto auto;
  font-size: 1.25rem;
  cursor: pointer;
`;

const Row = styled.div`
  display: flex;
`;

// Fusion wraps the masthead in this; it sets the anchor's height so the image
// resolves against the bar rather than its own intrinsic size.
const LinkStyle = styled.a`
  text-decoration: none;
  color: #000000;
  height: 100%;
`;

const HeaderIcon = ({ isOpen }) => (
  <FontAwesomeIcon
    icon={isOpen ? faAngleUp : faAngleDown}
    size="1x"
    color={white}
  />
);

// Paths in sections.js that this site serves itself, so they route in-app
// instead of bouncing out to columbiaspectator.com.
const INTERNAL_ROUTES = {
  "/multimedia/crosswords/": "/",
};

const SectionMenu = ({ section, openSection, setOpenSection, onNavigate }) => {
  const isOpen = section.section === openSection;

  return (
    <div>
      <Row>
        <a href={absolute(section.sectionURL)}>
          <SectionButton>{section.section}</SectionButton>
        </a>

        {section.menu.length > 0 && (
          <Toggle onClick={() => setOpenSection(isOpen ? "" : section.section)}>
            <HeaderIcon isOpen={isOpen} />
          </Toggle>
        )}
      </Row>

      {isOpen && (
        <DropDownList>
          {section.menu.map((item) => {
            const internal = INTERNAL_ROUTES[item.URL];

            // An in-app link doesn't reload the page, so the menu has to be
            // closed by hand or it stays open over the destination.
            return internal ? (
              <Link key={item.URL} to={internal} onClick={onNavigate}>
                <LittleLink>{item.name}</LittleLink>
              </Link>
            ) : (
              <a key={item.URL} href={absolute(item.URL)}>
                <LittleLink>{item.name}</LittleLink>
              </a>
            );
          })}
        </DropDownList>
      )}
    </div>
  );
};

const SideBarExtended = ({
  clicked,
  openSection,
  setOpenSection,
  onNavigate,
}) => {
  if (clicked === null) return <div />;

  return (
    <SideBarContainer $animation={clicked ? slideRight : slideLeft}>
      {clicked &&
        sections.map((section) => (
          <SectionMenu
            key={section.section}
            section={section}
            openSection={openSection}
            setOpenSection={setOpenSection}
            onNavigate={onNavigate}
          />
        ))}
    </SideBarContainer>
  );
};

const SpecNavbar = () => {
  const [clicked, setClicked] = useState(null);
  const [width, setWidth] = useState(
    typeof window === "undefined" ? 1024 : window.innerWidth,
  );
  const [searchValue, setSearchValue] = useState("");
  const [mobileSearch, setMobileSearch] = useState(false);
  const [openSection, setOpenSection] = useState("");

  useEffect(() => {
    const updateWindowDimensions = () => setWidth(window.innerWidth);

    updateWindowDimensions();
    window.addEventListener("resize", updateWindowDimensions);
    return () => window.removeEventListener("resize", updateWindowDimensions);
  }, []);

  const toggleClass = () => {
    if (clicked) setOpenSection("");
    setClicked(!clicked);
  };

  const submitSearch = (event) => {
    event.preventDefault();
    window.location.href = `${SPEC_BASE}/search=${encodeURIComponent(searchValue)}&from=0/`;
  };

  const isMobile = width <= MOBILE;
  const isSmallMobile = width <= 425;

  return (
    <Wrapper>
      <SideBarExtended
        clicked={clicked}
        openSection={openSection}
        setOpenSection={setOpenSection}
        onNavigate={() => {
          setClicked(false);
          setOpenSection("");
        }}
      />

      <Bar>
        <BarContainer>
          <HamburgerWrapper>
            <Hamburger onClick={toggleClass} aria-label="Open section menu">
              <FontAwesomeIcon
                icon={faBars}
                fixedWidth
                size="2x"
                color={white}
              />
            </Hamburger>
          </HamburgerWrapper>

          {isSmallMobile && mobileSearch ? null : (
            <LogoContainer>
              <LinkStyle href={SPEC_BASE}>
                <Logo
                  src="https://spec-imagehosting.s3.amazonaws.com/CDSwhitemasthead.png"
                  alt="Columbia Daily Spectator"
                />
              </LinkStyle>
            </LogoContainer>
          )}

          <LinkContainer>
            {isMobile ? (
              mobileSearch ? (
                <>
                  <FontAwesomeIcon
                    icon={faSearch}
                    fixedWidth
                    size="xs"
                    color={white}
                  />
                  <form onSubmit={submitSearch}>
                    <Input
                      onBlur={() => setMobileSearch(false)}
                      onChange={(e) => setSearchValue(e.target.value)}
                      value={searchValue}
                      aria-label="Search Spectator"
                      autoFocus
                    />
                  </form>
                </>
              ) : (
                <MobileSearchButton
                  onClick={() => setMobileSearch(true)}
                  aria-label="Search"
                >
                  <FontAwesomeIcon icon={faSearch} size="2x" color={white} />
                </MobileSearchButton>
              )
            ) : (
              <>
                <IconWrapper>
                  <FontAwesomeIcon
                    icon={faSearch}
                    fixedWidth
                    size="xs"
                    color={white}
                  />
                </IconWrapper>
                <form onSubmit={submitSearch}>
                  <Input
                    onChange={(e) => setSearchValue(e.target.value)}
                    value={searchValue}
                    aria-label="Search Spectator"
                  />
                </form>
              </>
            )}
          </LinkContainer>
        </BarContainer>
      </Bar>
    </Wrapper>
  );
};

export default SpecNavbar;
