
import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Home from "./Home";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";
import CatAssistant from "./CatAssistant";
import "./index.css";

function PageLoader() {
  const [stage, setStage] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 400),
      setTimeout(() => setStage(2), 1200),
      setTimeout(() => setStage(3), 2100),
      setTimeout(() => setStage(4), 3000),
      setTimeout(() => setFinished(true), 3700),
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  if (finished) return null;

  return (
    <div
      className={`cinematic-loader ${stage >= 4 ? "cinematic-exit" : ""
        }`}
    >
      <div className="cinema-glow cinema-glow-one" />
      <div className="cinema-glow cinema-glow-two" />
      <div className="cinema-grid" />

      <div className="cinema-content">
        <div
          className={`cinema-emblem ${stage >= 1 ? "reveal" : ""
            }`}
        >
          <span>S</span>
          <span className="emblem-plus">+</span>
          <div className="emblem-ring" />
        </div>

        <div
          className={`cinema-title ${stage >= 2 ? "reveal" : ""
            }`}
        >
          <h1>
            SMARTCRM <span>AI</span>
          </h1>
        </div>

        <p
          className={`cinema-tagline ${stage >= 3 ? "reveal" : ""
            }`}
        >
          INTELLIGENCE. AUTOMATION. GROWTH.
        </p>

        <div
          className={`cinema-loading ${stage >= 3 ? "reveal" : ""
            }`}
        >
          <div className="cinema-loading-track">
            <div className="cinema-loading-fill" />
          </div>

          <span>
            {stage >= 4
              ? "WELCOME"
              : "PREPARING YOUR EXPERIENCE"}
          </span>
        </div>
      </div>

      <div className="cinema-bottom-line" />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <PageLoader />

      <Routes>
        {/* Public user page */}
        <Route path="/" element={<Home />} />

        {/* Admin login page */}
        <Route
          path="/admin-login"
          element={
            <>
              <AdminLogin />
              <CatAssistant />
            </>
          }
        />

        {/* Admin dashboard */}
        <Route
          path="/admin"
          element={
            <>
              <AdminDashboard />
              <CatAssistant />
            </>
          }
        />

        {/* Unknown routes return to the home page */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
