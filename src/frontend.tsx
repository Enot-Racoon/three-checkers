/**
 * This file is the entry point for the React app, it sets up the root
 * element and renders the App component to the DOM.
 *
 * It is included in `src/index.html`.
 */

import { StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";
import App from "@/app";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const elem = document.getElementById("root")!;
const app = (
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);

if (import.meta.hot) {
  // With hot module reloading, `import.meta.hot.data` is persisted.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const root = (import.meta.hot.data.root ??= createRoot(elem)) as Root;
  root.render(app);
} else {
  // The hot module reloading API is not available in production.
  createRoot(elem).render(app);
}
