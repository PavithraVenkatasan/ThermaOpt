import { BrowserRouter, Routes, Route } from "react-router-dom";
import Designer from "./pages/Designer";
import Results from "./pages/Results";
import History from "./pages/History";
import Materials from "./pages/Materials";
import Optimization from "./pages/Optimization";

import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";

// Placeholder removed

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />

         <Route path="/designer" element={<Designer />} />

          <Route
            path="/results"
            element={<Results />}
          />

          <Route path="/results" element={<Results />} />
          <Route path="/results/:id" element={<Results />} />
          <Route path="/history" element={<History />} />
          <Route path="/materials" element={<Materials />} />
          <Route path="/optimize" element={<Optimization />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}