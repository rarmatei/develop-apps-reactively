type LoadingBarCallback = (total?: number, loaded?: number) => void;

let broadcastShow: LoadingBarCallback | null;
let broadcastHide: () => void | null;

export function initLoadingBar(total?: number, loaded?: number) {
  const loadingController = {
    show: show.bind(null, total, loaded),
    hide
  };
  return Promise.resolve(loadingController);
}

function show(total?: number, loaded?: number) {
  return new Promise(() => {
    broadcastShow && broadcastShow(total, loaded);
  });
}

function hide() {
  return new Promise(() => {
    broadcastHide && broadcastHide();
  });
}

export function connect(showCb: LoadingBarCallback, hideCb: () => void) {
  broadcastShow = showCb;
  broadcastHide = hideCb;
}
