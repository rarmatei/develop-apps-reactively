import {
  ReplaySubject,
  Observable,
  Subject,
  merge,
  empty,
  interval,
  timer,
  race,
  of,
  combineLatest
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
  first,
  shareReplay,
  delay,
  debounceTime,
  max,
  repeat
} from "rxjs/operators";

import { initLoadingBar } from "./LoadingBarService";
import { time } from "ionicons/icons";

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
      shareReplay(1) //show how it doesn't work - then add the share() - then show why we need to change to shareReplay(1)
    );

    const hideLoader = currentLoadCount.pipe(filter(count => count === 0));

    const showLoader = currentLoadCount.pipe(
      pairwise(),
      filter(([prev, curr]) => curr === 1 && prev === 0)
    );

    /*
      decide on a flash threshold: 2 seconds
      once something starts, give it at least a second to hide itself
      if it doesn't, we assume it's a long task, so we show the loader
      once we show the loader, we want to have it for at least 1 second on the screen
    */

    const flashThresholdMs = 2000;

    const showWithDelay = showLoader.pipe(
      switchMap(() => {
        return timer(flashThresholdMs).pipe(takeUntil(hideLoader));
      })
    );

    const hideDelayed = combineLatest(
      hideLoader.pipe(first()),
      timer(flashThresholdMs)
    );

    const loadCounter = currentLoadCount.pipe(
      scan(
        ({ loaded, runningCount }, currCount) => {
          return {
            loaded: currCount < runningCount ? loaded + 1 : loaded,
            runningCount: currCount
          };
        },
        { loaded: 0, runningCount: 0 }
      ),
      map(loadStats => ({
        max: loadStats.loaded + loadStats.runningCount,
        loaded: loadStats.loaded
      }))
    );

    const displayLoader = loadCounter.pipe(
      switchMap(stats => this.displayLoader(stats.max, stats.loaded))
    );

    showWithDelay
      .pipe(switchMap(() => displayLoader.pipe(takeUntil(hideDelayed))))
      .subscribe();
  }

  somethingStarted() {
    this._loadStarts.next();
  }

  somethingFinished() {
    this._loadEnds.next();
  }

  displayLoader(total: number, loaded: number) {
    return new Observable(observer => {
      const loadingBarPromise = initLoadingBar(total, loaded);
      loadingBarPromise.then(loadingBar => loadingBar.show());
      return () => {
        loadingBarPromise.then(loadingBar => loadingBar.hide());
      };
    });
  }
}

const service = new Service();

/*
1. the above - initial show and hide, connect the service as an observable
2. requirements come in - it shouldn't flash, it needs the delay when appearing and delay before dissapearing
3. display loading bar as they come, use the max() with repeat() to count loads
4. konami - hide when sequence activated
5. tracker operator and trackable promise
*/

/*
after writing the loadStarts and loadEnds subject:
so I know what we've done doesn't seem like a big deal
but now we are fully in RxJS functional land. At this point, we're done
with all this mental context of services and how it's going to be used
in the Ionic app. We can now focus and work with just these two observables:
one that tells us when a load started, and another one that tells us
when it ended.

Try to see if I can work backwards - build the larger observable
as pseudo code and work backwards

say that we can make it to accept observables - but that would
introduce a range of things we have to cater for - for example, we want this
to be a passive service, that doesn't generate any other work besides
showing the bar at the bottom - so because of that we'd only be able to send
in hot observables, as cold ones generate new subscriptions
or what if we want to use promises?
we want to keep it as simple as possible, we'll use an up and down method for now
we'll then build further abstractions on top of it
*/

export default service;
