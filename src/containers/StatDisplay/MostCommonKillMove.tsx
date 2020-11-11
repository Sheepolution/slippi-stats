import { Stat } from "components/Stat";
import { useParam } from "lib/hooks";
import React from "react";

export const MostCommonKillMove: React.FC = () => {
  const [mckm1, setMckm1] = useParam("mckm1", "0");
  const [mckm2, setMckm2] = useParam("mckm2", "0");
  return (
    <Stat
      leftText={mckm1}
      onLeftTextBlur={(text) => setMckm1(text)}
      label="MOST COMMON KILL MOVE"
      rightText={mckm2}
      onRightTextBlur={(text) => setMckm2(text)}
    />
  );
};
