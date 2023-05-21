const { SlippiGame } = window.require('@slippi/slippi-js');
const path = window.require('path');
const fs = window.require('fs');
const chokidar = window.require('chokidar');
const _ = window.require('lodash');

let directory: string;
let watcher: any;

let callbackStarted: Function;
let callbackFinished: Function;

export const onGameStarted = (cb: Function) => {
  callbackStarted = cb
}

export const onGameFinished = (cb: Function) => {
  callbackFinished = cb
}

const gameByPath: any = {};

let timeout: any;

export const setDirectory = (dir: string) => {
  if (timeout) {
    clearTimeout(timeout);
  }
  
  timeout = setTimeout(() => {
    directory = dir
    if (watcher) {
      watcher.close()
    }
    
    watcher = chokidar.watch(path.join(directory, "*.slp"), {
      ignoreInitial: true,
      usePolling: true,
      interval: 500,
      persistent: true,
    })
    
    watcher.on("change", (pathString: string) => {
      let gameState, settings, gameEnd;
      try {
        let game = _.get(gameByPath, [pathString, "game"]);
        if (!game) {
          console.log(`New file at: ${pathString}`);
          // Make sure to enable `processOnTheFly` to get updated stats as the game progresses
          game = new SlippiGame(pathString, { processOnTheFly: true });
          gameByPath[pathString] = {
            game: game,
            state: {
              settings: null,
            },
          };
        }
        
        gameState = _.get(gameByPath, [pathString, "state"]);
        
        settings = game.getSettings();
        gameEnd = game.getGameEnd();
      } catch (err) {
        console.log(err);
        return;
      }
      
      if (!gameState.settings && settings) {
        console.log(`[Game Start] New game has started`);
        gameState.settings = settings;
        
        if (callbackStarted) {
          callbackStarted()
        }
      }
      
      if (gameEnd) {
        if (callbackFinished) {
          const file = new File([fs.readFileSync(pathString)], pathString.split('/').pop() || '');
          callbackFinished(file)
        }
      }
    });
  }, 1000);
}