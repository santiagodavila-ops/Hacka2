type ViewTransitionLike = {
  finished: Promise<void>;
};

type DocumentWithViewTransition = Document & {
  startViewTransition?: (callback: () => void) => ViewTransitionLike;
};

export function runViewTransition(
  callback: () => void,
  prefersReducedMotion: boolean,
): void {
  const transitionDocument = document as DocumentWithViewTransition;

  if (
    prefersReducedMotion ||
    typeof transitionDocument.startViewTransition !== "function"
  ) {
    callback();
    return;
  }

  transitionDocument.startViewTransition(callback);
}