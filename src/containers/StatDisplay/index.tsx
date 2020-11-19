/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import styled from "@emotion/styled";
import { Block } from "components/Block";
import { GameDisplay } from "components/GameDisplay";
import { useGames, useParam } from "lib/hooks";
import React from "react";

import { Statistic } from "./Statistic";

const Divider = styled.div`
  content: " ";
  display: block;
  height: 0.1rem;
  width: 100%;
  margin-top: 0.7rem;
  background-color: rgba(255, 255, 255, 0.05);
`;

const ScoreBlock = styled(Block)`
  padding: 0.5rem 4rem;
  font-size: 5rem;
  font-weight: 800;
  position: absolute;
  bottom: -6rem;
  left: 50%;
  transform: translateX(-50%);
`;

export const StatDisplay: React.FC<{
  primaryColor: string;
  secondaryColor: string;
  leftColor: string;
  rightColor: string;
}> = (props) => {
  const { games, score, setGame } = useGames();
  const [stats] = useParam("stats");
  const winningSide = score.left > score.right ? "left" : score.right > score.left ? "right" : "";
  const { leftColor, rightColor, ...theme } = props;

  const mapStatToElement = (statId: string, index: number) => {
    if (statId) {
      return <Statistic key={statId} statId={statId} theme={theme} />;
    }
    return <Divider key={`divider-${index}`} />;
  };

  const statsList = stats.split(",");
  const statComponents = statsList.map(mapStatToElement);

  return (
    <div
      css={css`
        background: linear-gradient(to right, ${props.secondaryColor}, transparent, ${props.secondaryColor});
        width: 100%;
      `}
    >
      <div
        css={css`
          display: grid;
          grid-template-columns: 100%;
          grid-row-gap: 2rem;
          margin: 4rem;
        `}
      >
        {statComponents}
        <Divider />
        <GameDisplay
          games={games}
          updateGameInfo={setGame}
          winningSide={winningSide}
          leftColor={leftColor}
          rightColor={rightColor}
        />
      </div>
      <ScoreBlock color="white" backgroundColor={props.primaryColor}>
        {`${score.left} - ${score.right}`}
      </ScoreBlock>
    </div>
  );
};
