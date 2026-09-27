import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";

// GPT called directly; react-dfp's slot teardown throws on every unmount.
const DFP_NETWORK_ID = "59699124";

// Leading slash matters — first thing to try if slots never fill.
const adUnitPath = (name) => `/${DFP_NETWORK_ID}/${name}`;

const UNITS = {
  leaderboard: { path: "cds_leaderboard", width: 728, height: 90 },
  leaderboardMobile: { path: "cds_leaderboard_mobile", width: 320, height: 50 },
  verticalBox: { path: "cds_vertical_box", width: 300, height: 600 },
  horizontalBox: { path: "cds_horizontal_box", width: 720, height: 300 },
  horizontalBoxMobile: {
    path: "cds_horizontal_box_mobile",
    width: 300,
    height: 250,
  },
};

const MOBILE = 768;
const MOBILE_QUERY = `(max-width: ${MOBILE}px)`;
const GPT_SRC = "https://securepubads.g.doubleclick.net/tag/js/gpt.js";

let gptPromise = null;
let servicesEnabled = false;
let slotSeq = 0;

function loadGpt() {
  if (gptPromise) return gptPromise;

  gptPromise = new Promise((resolve, reject) => {
    window.googletag = window.googletag || { cmd: [] };

    if (document.getElementById("gpt-js")) {
      resolve(window.googletag);
      return;
    }

    const script = document.createElement("script");
    script.id = "gpt-js";
    script.async = true;
    script.src = GPT_SRC;
    script.crossOrigin = "anonymous";
    script.onload = () => resolve(window.googletag);
    script.onerror = () => reject(new Error("Failed to load GPT"));

    document.head.appendChild(script);
  });

  return gptPromise;
}

// Fixed size reserves the space, so a late ad can't shift the page.
const Frame = styled.div`
  display: flex;
  justify-content: center;
  width: ${(props) => props.$width}px;
  height: ${(props) => props.$height}px;
  max-width: 100%;
  margin: 0 auto;
`;

function useIsMobile() {
  // Read before paint, so no second slot is defined for the wrong breakpoint.
  const [isMobile, setIsMobile] = useState(() =>
    typeof window === "undefined"
      ? false
      : window.matchMedia(MOBILE_QUERY).matches,
  );

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    const onChange = (event) => setIsMobile(event.matches);

    setIsMobile(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}

const AdSlot = ({ unit }) => {
  const config = UNITS[unit];

  // Two vertical boxes share a page, so ids can't be derived from the unit.
  const divIdRef = useRef(null);
  if (divIdRef.current === null) {
    slotSeq += 1;
    divIdRef.current = `gpt-${unit}-${slotSeq}`;
  }
  const divId = divIdRef.current;

  useEffect(() => {
    if (!config) return undefined;

    let cancelled = false;
    let definedSlot = null;

    loadGpt()
      .then((googletag) => {
        if (cancelled) return;

        googletag.cmd.push(() => {
          // May have unmounted while queued.
          if (cancelled) return;

          const slot = googletag.defineSlot(
            adUnitPath(config.path),
            [[config.width, config.height]],
            divId,
          );

          // Null on a bad path or duplicate div id.
          if (!slot) return;

          slot.addService(googletag.pubads());
          definedSlot = slot;

          if (!servicesEnabled) {
            googletag.enableServices();
            servicesEnabled = true;
          }

          googletag.display(divId);
        });
      })
      .catch((err) => console.error("GPT failed to load:", err));

    return () => {
      cancelled = true;
      if (!definedSlot) return;

      const googletag = window.googletag;
      if (!googletag?.cmd) return;

      const slot = definedSlot;
      definedSlot = null;
      googletag.cmd.push(() => googletag.destroySlots([slot]));
    };
  }, [config, divId]);

  if (!config) return null;

  return (
    <Frame $width={config.width} $height={config.height}>
      <div id={divId} />
    </Frame>
  );
};

// Only the current breakpoint's unit renders — a hidden slot still requests an
// ad, which skews fill rate.
export const Leaderboard = () => {
  const unit = useIsMobile() ? "leaderboardMobile" : "leaderboard";
  return <AdSlot key={unit} unit={unit} />;
};

export const HorizontalBox = () => {
  const unit = useIsMobile() ? "horizontalBoxMobile" : "horizontalBox";
  return <AdSlot key={unit} unit={unit} />;
};

// The rail sits beside the content on desktop but drops below it on phones,
// where two half-page units would add 1200px of page.
export const VerticalBox = () => {
  const unit = useIsMobile() ? "horizontalBoxMobile" : "verticalBox";
  return <AdSlot key={unit} unit={unit} />;
};

export default AdSlot;
