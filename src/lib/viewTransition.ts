// View Transition API con fallback funcional (Checkpoint 5).
// Si el navegador soporta document.startViewTransition, animamos el cambio de
// pantalla; si no (o si el usuario pidió reducir movimiento), ejecutamos el
// callback directamente: misma navegación, sin animación. Sin "any".

type TransitionCallback = () => void;

export function supportsViewTransitions(): boolean {
  return typeof document.startViewTransition === "function";
}

export function withViewTransition(callback: TransitionCallback): void {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduceMotion && typeof document.startViewTransition === "function") {
    document.startViewTransition(callback);
  } else {
    callback();
  }
}
