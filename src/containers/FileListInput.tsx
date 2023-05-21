/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { PrimaryButton, SecondaryButton } from "components/Buttons";
import { DropPad } from "components/DropPad";
import { ErrorMessage } from "components/ErrorMessage";
import { FileList } from "components/FileList";
import { readFileAsGameDetails } from "lib/readFile";
import { generateSearchParams } from "lib/searchParams";
import { generateStatParams } from "lib/stats";
import { GameDetails, Stat } from "lib/stats/types";
import React, { useCallback, useContext, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";

import { AppContext, Types } from "../store";
import { onGameFinished, onGameStarted, setDirectory } from "../store/autoloader"
import { SetCallback } from "./RenderDisplay";
import { StatOption, StatOptions } from "./StatOptions";

const STAT_OPTIONS_STORE_KEY = "statOptions";

const ALL_STATS: string[] = [
  Stat.INPUTS_PER_MINUTE,
  Stat.DAMAGE_PER_OPENING,
  Stat.OPENINGS_PER_KILL,
  Stat.DAMAGE_DONE,
  Stat.AVG_KILL_PERCENT,
  Stat.NEUTRAL_WINS,
  Stat.L_CANCEL,
  Stat.FIRST_BLOOD,
  Stat.EARLY_KILLS,
  Stat.LATE_DEATHS,
  Stat.SELF_DESTRUCTS,
  Stat.HIGH_DAMAGE_PUNISHES,
];

const DEFAULT_STATS = [Stat.OPENINGS_PER_KILL, Stat.DAMAGE_DONE, Stat.AVG_KILL_PERCENT, Stat.NEUTRAL_WINS];

let numberOfFiles = 0;
let mergeStats = false
let keepFiles = false
let nextFile: File|null = null;

const getDefaultStats = (): StatOption[] => {
  const current = DEFAULT_STATS.map((s) => ({
    statId: s,
    enabled: true,
  }));
  return validateStatOptions(current);
};

const validateStatOptions = (current: StatOption[]): StatOption[] => {
  const newItems: StatOption[] = ALL_STATS.filter(
    (statId) => !current.find((option) => option.statId === statId)
  ).map((statId) => ({ statId, enabled: false }));

  // Make sure the ones we're showing are supported
  const currentItems = current.filter((c) => ALL_STATS.includes(c.statId));
  return [...currentItems, ...newItems];
};

const generateStatsList = (options: StatOption[]): string[] => {
  const statsList = options.filter((s) => s.enabled).map((s) => s.statId);
  return [Stat.KILL_MOVES, Stat.NEUTRAL_OPENER_MOVES, "", ...statsList];
};

export const FileListInput: React.FC<{ buttonColor: string }> = ({ buttonColor }) => {
  const history = useHistory();
  const location = useLocation();
  const { state, dispatch } = useContext(AppContext);
  const [error, setError] = React.useState<any>(null);
  const [showOptions, setShowOptions] = React.useState(false);
  const [readyToGo, setReadyToGo] = React.useState(false);

  const clearAll = () => {
    dispatch({
      type: Types.CLEAR_ALL,
    });
    history.replace("/");
    console.log("History length", history.length);
  };

  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setDirectory(e.target.value);
  };

  const onChangeMerge = (e: React.FocusEvent<HTMLInputElement>) => {
    mergeStats = e.target.checked;
  };

  const onChangeKeep = (e: React.FocusEvent<HTMLInputElement>) => {
    keepFiles = e.target.checked;
  };

  let defaultStats = getDefaultStats();
  let statsModified = false;
  // Since we're persisting user options in localStorage, we need to be able to
  // handle the case where new options are available, yet not in their localStorage.
  const restoredStatsString = localStorage.getItem(STAT_OPTIONS_STORE_KEY);
  if (restoredStatsString) {
    statsModified = restoredStatsString !== JSON.stringify(defaultStats);
    defaultStats = validateStatOptions(JSON.parse(restoredStatsString));
  }

  const [statOptions, setStatOptions] = React.useState<StatOption[]>(defaultStats);

  const onStatOptionReset = () => {
    onStatOptionChange(getDefaultStats());
  };

  const onStatOptionChange = (options: StatOption[]) => {
    localStorage.setItem(STAT_OPTIONS_STORE_KEY, JSON.stringify(options));
    setStatOptions(options);
  };

  const onClick = useCallback(() => {
    try {
      const gameDetails = state.files.filter((f) => f.details !== null).map((f) => f.details as GameDetails);
      const params = generateStatParams(gameDetails, generateStatsList(statOptions));
      const search = "?" + generateSearchParams(params).toString();
      history.push({
        pathname: "/render",
        search,
      });
    } catch (err) {
      console.error(error);
      setError(err);
    }
  },
  [error, history, setError, statOptions, state.files]);

  const onSpecific = useCallback((n: number) => {
    try {
      const gameDetails = state.files.filter((f) => f.details !== null).map((f) => f.details as GameDetails);
      let params;
      if (n > gameDetails.length || n === 0) {
        params = generateStatParams(gameDetails, generateStatsList(statOptions));
      } else {
        params = generateStatParams([gameDetails[n - 1]], generateStatsList(statOptions));
      }
      const search = "?" + generateSearchParams(params).toString();
      history.push({
        pathname: "/render",
        search,
      });
    } catch (err) {
      console.error(error);
      setError(err);
    }
  },
  [error, history, setError, statOptions, state.files]);

  SetCallback(onSpecific);

  useEffect(() => {
    if (nextFile) {
      if (!keepFiles && state.files.length > 0) {
        clearAll();
      }
      
      onDrop([nextFile]);
      nextFile = null;
    }
  });
  
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isNaN(parseInt(e.key))) {
        onSpecific(parseInt(e.key));
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    // Don't forget to clean up
    return function cleanup() {
      document.removeEventListener('keydown', handleKeyDown);
    }
  }, [onSpecific]);

  useEffect(() => {
    if (state.files.length === 0) {
      numberOfFiles = 0;
      return;
    }

    if (!state.files[state.files.length - 1].details) {
      return;
    }

    if (!readyToGo) {
      return;
    }

    if (mergeStats) {
      onClick();
      return;
    }

    onSpecific(state.files.length);
    numberOfFiles = state.files.length;
  }, [state.files, readyToGo, onSpecific, onClick]);

  const onRemove = (filename: string) => {
    dispatch({
      type: Types.REMOVE_FILE,
      payload: {
        filename,
      },
    });
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // Track how long processing takes
      const startTime = new Date().getTime();

      // First add all the files to the store
      dispatch({
        type: Types.ADD_FILES,
        payload: {
          files: acceptedFiles,
        },
      });

      const promises = acceptedFiles.map(async (file) => {
        try {
          const details = await readFileAsGameDetails(file);
          dispatch({
            type: Types.SET_DETAILS,
            payload: {
              filename: file.name,
              details,
            },
          });
        } catch (err) {
          console.error(error);
          dispatch({
            type: Types.SET_ERROR,
            payload: {
              filename: file.name,
              error: err,
            },
          });
        }
      });

      // Print the time taken when complete
      Promise.all(promises).then(() => {
        const time = new Date().getTime() - startTime;
        setReadyToGo(true);
        console.log(`Finished processing in ${time}ms`);
      });
    },
    [dispatch, error]
  );

  onGameFinished((file: File) => {
    history.push({
      pathname: "/",
    });

    nextFile = file;
  });

  // onGameStarted(() => {
  // });

  const finishedProcessing = !state.files.find((f) => f.loading);
  const buttonText =
    state.files.length === 0 ? "NO FILES ADDED" : finishedProcessing ? "GENERATE STATS" : "PLEASE WAIT";

  if (showOptions) {
    return (
      <StatOptions
        onClose={() => setShowOptions(false)}
        value={statOptions}
        onChange={onStatOptionChange}
        onReset={onStatOptionReset}
        hideReset={!statsModified}
      />
    );
  }

  return (
    <div
      css={css`
        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        width: 100%;
        height: 100%;
      `}
    >
      <SecondaryButton align="right" onClick={() => setShowOptions(true)}>
        customize stats
      </SecondaryButton>

      <div>
        <input type="checkbox" id="keep" onChange={onChangeKeep} />
        <label htmlFor="keep">Keep files</label>
      </div>
      <div>
        <input type="checkbox" id="merge" onChange={onChangeMerge} />
        <label htmlFor="merge">Merge stats</label>
      </div>
      <br/>
      <input type="text" placeholder="Path to your slippi files" onBlur={onBlur} />
      <br/>
      <DropPad accept=".slp" onDrop={onDrop} />
      <div
        css={css`
          overflow: auto;
          display: flex;
          flex-direction: column;
          margin: 1rem 0;
        `}
      >
        <FileList files={state.files} onRemove={onRemove} />
      </div>
      <div>
        <PrimaryButton
          backgroundColor={buttonColor}
          color="white"
          // disabled={state.files.length === 0 || !finishedProcessing}
          onClick={onClick}
        >
          {buttonText}
        </PrimaryButton>
        {state.files.length > 0 && <SecondaryButton onClick={clearAll}>reset</SecondaryButton>}
      </div>
      {error && <ErrorMessage>{error.message}</ErrorMessage>}
    </div>
  );
};
