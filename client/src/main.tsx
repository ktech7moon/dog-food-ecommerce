import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Initialize with a default theme class to prevent flash
// The actual theme will be set by ThemeContext based on user preference
document.documentElement.classList.add('light');

createRoot(document.getElementById("root")!).render(
  <App />
);
