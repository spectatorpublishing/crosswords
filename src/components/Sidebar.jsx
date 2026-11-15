import React from "react";
import styled from "styled-components";
import { VerticalBox } from "./AdSlot";

const Rail = styled.aside`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
  width: 100%;
`;

const Sidebar = () => (
  <Rail>
    <VerticalBox />
    <VerticalBox />
  </Rail>
);

export default Sidebar;
