import {
  ReplaySubject,
  Observable,
  Subject,
  merge,
  empty,
  interval
} from "rxjs";
import {
  mapTo,
  scan,
  map,
  switchMap,
  distinctUntilChanged,
  startWith,
  filter,
  pairwise,
  takeUntil,
  tap,
  share,
  shareReplay
} from "rxjs/operators";

import { initLoadingBar } from "./LoadingBarService";

//don't make this into a class, make it into a simple module
class Service {
  private _loadStarts = new Subject();
  private _loadEnds = new Subject();

  constructor() {
    const loadUp = this._loadStarts.pipe(mapTo(1));
    const loadDown = this._loadEnds.pipe(mapTo(-1));

    const loadVariations = merge(loadUp, loadDown);

    const currentLoadCount = loadVariations.pipe(
      scan((currLoads, loadEvent) => {
        const newCount = currLoads + loadEvent;
        //ensures it doesn't go below zero
        return newCount > 0 ? newCount : 0;
      }, 0),
      startWith(0),
      distinctUntilChanged(), //in case of multiple zeros,
      share() //show how it doesn't work - then add the share()
    );

    const hideLoader = currentLoadCount.pipe(filter(count => count === 0));

    const showLoader = currentLoadCount.pipe(
      pairwise(),
      filter(([prev, curr]) => curr === 1 && prev === 0)
    );

    showLoader
      .pipe(switchMap(() => this.displayLoader().pipe(takeUntil(hideLoader))))
      .subscribe();
  }

  somethingStarted() {
    this._loadStarts.next();
  }

  somethingFinished() {
    this._loadEnds.next();
  }

  displayLoader() {
    return new Observable(observer => {
      const loadingBarPromise = initLoadingBar();
      loadingBarPromise.then(loadingBar => loadingBar.show());
      return () => {
        loadingBarPromise.then(loadingBar => loadingBar.hide());
      };
    });
  }
}

const service = new Service();
export default service;
