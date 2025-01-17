/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import styled from "@emotion/styled";
import { useParam } from "lib/hooks";
import { PortColor } from "lib/portColor";
import React, { useEffect } from "react";
import { Theme } from "styles/theme";

import { CharDisplay } from "./CharDisplay";
import { NameBlock } from "./NameBlock";
import { StatDisplay } from "./StatDisplay";

const Outer = styled.div`
  position: relative;
  width: 100%;
  display: grid;
  grid-template-columns: 20% 60% 20%;
`;

const NameBlockContainer = styled.div<{
  align: "left" | "right";
}>`
  ${(p) => `
  width: 20%;
  position: absolute;
  ${p.align}: 0;
  margin-${p.align}: 2rem;
  bottom: 15%;
  `}
`;

let callback: Function;

export const SetCallback = (cb: Function) => {
  callback = cb;
}

export const RenderDisplay: React.FC<Theme> = (theme) => {
  const [leftColor] = useParam("leftColor", PortColor.P1);
  const [rightColor] = useParam("rightColor", PortColor.P2);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isNaN(parseInt(e.key))) {
        callback(parseInt(e.key));
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return function cleanup() {
      document.removeEventListener('keydown', handleKeyDown);
    }
  });


  return (
    <Outer>
      <div
        css={css`
          justify-self: end;
          width: 100%;
        `}
      >
        <CharDisplay theme={leftColor} charParam="char1" colorParam="color1" align="right" />
      </div>
      <StatDisplay leftColor={leftColor} rightColor={rightColor} {...theme} />
      <div
        css={css`
          width: 100%;
        `}
      >
        <CharDisplay theme={rightColor} charParam="char2" colorParam="color2" align="left" />
      </div>
      <NameBlockContainer align="left">
        <NameBlock nameParam="name1" subtitleParam="sub1" {...theme} />
      </NameBlockContainer>
      <NameBlockContainer align="right">
        <NameBlock nameParam="name2" subtitleParam="sub2" {...theme} />
      </NameBlockContainer>
    </Outer>
  );
};
