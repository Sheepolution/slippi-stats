import { generateDemoQuery } from "lib/demo";
import React from "react";
import { Redirect } from "react-router-dom";

export const RandomView: React.FC = () => {
  const paramMap = generateDemoQuery();
  const search = "?" + new URLSearchParams(paramMap).toString();
  return (
    <Redirect
      to={{
        pathname: "/render",
        search,
      }}
    />
  );
};