// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./assets/index.css"; // <-- same folder level, HUWAG ../src/

import App from "./pages/App";

const root = createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
