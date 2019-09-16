import { Observable } from "rxjs";
import LoaderService from "./AsyncTracker";

export function showLoadingStatus() {
  return (source: Observable<any>) => {
    return new Observable(observer => {
      LoaderService.somethingStarted();
      return source.subscribe({
        ...observer,
        next: value => {
          observer.next(value);
          LoaderService.somethingFinished();
        }
      });
    });
  };
}

export class PromiseWithLoadingProgress<T> extends Promise<T> {
  constructor(executor: any) {
    super((originalResolve, originalReject) => {
      const resolve = (...args: any[]) => {
        LoaderService.somethingFinished();
        return originalResolve(...args);
      };
      const reject = (...args: any[]) => {
        LoaderService.somethingFinished();
        return originalReject(...args);
      };
      return executor(resolve, reject);
    });
    LoaderService.somethingStarted();
  }
}
