/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import styled from "@emotion/styled";
import { ExternalLink as A } from "components/ExternalLink";
import { OBSDragButton } from "components/OBSDragButton";
import { useOnClickOutside } from "lib/hooks";
import { PortColor } from "lib/portColor";
import React from "react";
import { defaultTheme } from "styles/theme";

import { DualColorPanel } from "./Options/Panel";

const Outer = styled.div`
  opacity: 0.2;
  position: relative;
  background-color: black;
  &.closed:hover {
    cursor: pointer;
    opacity: 0.8;
  }
  &.open {
    opacity: 1;
    transform: translateY(-100%);
    .close-button {
      opacity: 1;
    }
  }
  transition: all 0.2s ease-in-out;
  .close-button {
    z-index: 10;
    position: absolute;
    right: 3rem;
    top: 1rem;
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
    color: black;
    background-color: white;
    padding: 0.2rem 1rem;
    font-weight: bold;
    font-size: 2.5rem;
    cursor: pointer;
    transform: translateY(-100%);
  }
`;

export const Settings: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const wrapperRef = React.useRef(null);

  useOnClickOutside(wrapperRef, () => {
    if (open) {
      setOpen(false);
    }
  });

  const onClick = () => {
    if (!open) {
      setOpen(true);
    }
  };

  return (
    <Outer className={open ? "open" : "closed"} ref={wrapperRef} onClick={onClick}>
      <div className="close-button" onClick={() => setOpen(false)}>
        ✕
      </div>

      <div
        css={css`
          text-align: center;
          position: absolute;
          width: 100%;
          top: 0;
          transform: translateY(-100%);
          background-color: inherit;
        `}
      >
        <h3
          css={css`
            margin: 0;
            padding: 1rem 0;
            font-size: 2rem;
            position: relative;
            &::before {
              content: "";
              display: block;
              background-image: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.2), transparent);
              height: 0.1rem;
              position: absolute;
              width: 80%;
              margin-left: 10%;
              bottom: 0;
            }
          `}
        >
          OPTIONS
        </h3>
      </div>
      <div
        css={css`
          padding-top: 2rem;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
        `}
      >
        <div>
          <DualColorPanel
            panelLabel="PLAYER COLOR"
            leftLabel="LEFT"
            rightLabel="RIGHT"
            leftDefault={PortColor.P1}
            leftColorParam="leftColor"
            rightColorParam="rightColor"
            rightDefault={PortColor.P2}
          />
        </div>
        <div
          css={css`
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding-top: 1rem;
          `}
        >
          <div>
            <OBSDragButton />
          </div>
          <div
            css={css`
              font-size: 1.5rem;
              padding: 2rem 0;
              opacity: 0.5;
              transition: opacity 0.1s ease-in-out;
              &:hover {
                opacity: 1;
              }
              a:hover {
                text-decoration: underline;
              }
            `}
          >
            Made with love by <A href="https://twitter.com/_vinceau">Vince Au</A>
          </div>
        </div>
        <div>
          <DualColorPanel
            panelLabel="THEME COLOR"
            leftLabel="PRIMARY"
            rightLabel="SECONDARY"
            leftDefault={defaultTheme.primaryColor}
            leftColorParam="primaryColor"
            rightColorParam="secondaryColor"
            rightDefault={defaultTheme.secondaryColor}
          />
        </div>
      </div>
    </Outer>
  );
};
