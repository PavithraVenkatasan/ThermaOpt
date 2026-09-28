import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white flex flex-col">
      
      <div className="px-6 py-6 border-b border-slate-700">
        <h1 className="text-xl font-semibold">ThermaOpt</h1>
        <p className="text-xs text-slate-400 mt-1">
          Thermal Shelter Design
        </p>
      </div>

      <nav className="p-4 space-y-2">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `block px-4 py-3 text-sm ${
              isActive
                ? "bg-slate-700 text-white"
                : "text-slate-300 hover:bg-slate-800"
            }`
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/designer"
          className={({ isActive }) =>
            `block px-4 py-3 text-sm ${
              isActive
                ? "bg-slate-700 text-white"
                : "text-slate-300 hover:bg-slate-800"
            }`
          }
        >
          Shelter Designer
        </NavLink>

        <NavLink
          to="/results"
          className={({ isActive }) =>
            `block px-4 py-3 text-sm ${
              isActive
                ? "bg-slate-700 text-white"
                : "text-slate-300 hover:bg-slate-800"
            }`
          }
        >
          Simulation Results
        </NavLink>

        <NavLink
          to="/history"
          className={({ isActive }) =>
            `block px-4 py-3 text-sm ${
              isActive
                ? "bg-slate-700 text-white"
                : "text-slate-300 hover:bg-slate-800"
            }`
          }
        >
          Simulation History
        </NavLink>

        <NavLink
          to="/materials"
          className={({ isActive }) =>
            `block px-4 py-3 text-sm ${
              isActive
                ? "bg-slate-700 text-white"
                : "text-slate-300 hover:bg-slate-800"
            }`
          }
        >
          Materials
        </NavLink>

        <NavLink
          to="/optimize"
          className={({ isActive }) =>
            `block px-4 py-3 text-sm ${
              isActive
                ? "bg-slate-700 text-white"
                : "text-slate-300 hover:bg-slate-800"
            }`
          }
        >
          What-If Analysis
        </NavLink>
      </nav>

      <div className="mt-auto p-4 border-t border-slate-700">
        <p className="text-xs text-slate-500">
          Engineering Design Platform
        </p>
      </div>

    </aside>
  );
}