/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import React from "react";
import styled from "@emotion/styled";

export interface HeadToHeadProps {
  // leftPicture: string;
  // rightPicture: string;
}

const Outer = styled.div`
  position: relative;
  display: block;
  height: 40px;
  width: 90px;
  background-color: red;
`;

const BaseHeadImage = styled.div`
  display: block;
  height: 100%;
  position: absolute;
  top: 0;
  background-repeat: no-repeat;
  background-size: contain;
`;

type Side = "left" | "right";

const flip = (side: Side): Side => (side === "left" ? "right" : "left");

const HeadImage = styled(BaseHeadImage)<{
  backgroundColor?: string;
  imageSrc: string;
  imageAlignment: Side;
  side: Side;
  waypoint: number;
}>`
  ${(p) => {
    const position = p.imageAlignment === p.side ? p.side : flip(p.side);
    const transform = p.imageAlignment === p.side ? "" : "transform: scaleX(-1);";
    const invWaypoint = 100 - p.waypoint;
    return `
      width: ${p.waypoint}%;
      background-image: url(${p.imageSrc});
      background-position: top ${position};
      ${p.backgroundColor && `background-color: ${p.backgroundColor}`};
      ${transform}
      ${
        p.side === "right" &&
        `
          clip-path: polygon(${p.waypoint}% 0, 100% 0, 100% 100%, ${invWaypoint}% 100%);
          padding-left: ${invWaypoint}%;
          right: 0;
        `
      }
    `;
  }}
`;

export const HeadToHead: React.FC<HeadToHeadProps> = () => {
  const waypoint = 55;
  const p1 = `${process.env.PUBLIC_URL}/images/characters/jigglypuff/headband/portrait.png`;
  const p1Align = "right";
  const p2 = `${process.env.PUBLIC_URL}/images/characters/pikachu/party-hat/portrait.png`;
  const p2Align = "right";

  return (
    <Outer>
      <HeadImage imageSrc={p1} waypoint={waypoint} imageAlignment={p1Align} side="left" />
      <HeadImage backgroundColor="green" imageSrc={p2} waypoint={waypoint} imageAlignment={p2Align} side="right" />
    </Outer>
  );
};