import { readFileAsGameDetails } from "lib/readFile";
const path = window.require('path');
const fs = window.require('fs');
const chokidar = window.require('chokidar');

let directory: string; 
let watcher: any;

let watchingFile: string|undefined;
let changed = false
let interval: any;
let callbackStarted: Function;
let callbackFinished: Function;
let waitForChange = false;

export const onGameStarted = (cb: Function) => {
  callbackStarted = cb
}

export const onGameFinished = (cb: Function) => {
  callbackFinished = cb
}

export const setDirectory = (dir: string) => {
  directory = dir;
  if (watcher) {
    watcher.close();
  }

  watcher = chokidar.watch(path.join(directory,'*.slp'), {
    ignoreInitial: true,
    usePolling: true,
    interval: 500,
  });

  watcher.on('add', (path: string) => {
    watchingFile = path.split('/').pop();
  
    watcher.add(path);
  
    if (callbackStarted) {
      callbackStarted();
    }
  
    interval = setInterval(async () => {
      if (!watchingFile) {
        return;
      }

      if (waitForChange) {
        return;
      }
  
      if (changed) {
        changed = false;
      } else {
        console.log("File stopped changing:", watchingFile);

        // Check if it's actually a valid file
        const file = new File([fs.readFileSync(path)], watchingFile)

        let game;
        try {
          game = await readFileAsGameDetails(file)
          if (game.gameEnd?.gameEndMethod === null) {
            return
          }
        } catch (error) {
          waitForChange = true
          return;
        }

        if (callbackFinished) {
          callbackFinished(file);
          watchingFile = undefined;
          watcher.unwatch(path);
          clearInterval(interval);
        }
      }
    }, 1000);
  });

  watcher.on('change', (path: string) => {
    const filename = path.split('/').pop();
    if (filename === watchingFile) {
      changed = true
      waitForChange = false;
    }
  });
}