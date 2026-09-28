import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSimulations, getDesigns, getClimate } from "../api/api";

export default function History() {
  const [simulations, setSimulations] = useState([]);
  const [designs, setDesigns] = useState({});
  const [climates, setClimates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [climateFilter, setClimateFilter] = useState("All");
  const [shapeFilter, setShapeFilter] = useState("All");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [simsRes, desRes, cliRes] = await Promise.all([
          getSimulations(),
          getDesigns(),
          getClimate()
        ]);
        
        const desMap = {};
        desRes.data.forEach(d => { desMap[d.id] = d; });
        setDesigns(desMap);

        const cliMap = {};
        cliRes.data.forEach(c => { cliMap[c.id] = c; });
        setClimates(cliMap);

        const sortedSims = simsRes.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setSimulations(sortedSims);
      } catch (err) {
        console.error("Failed to load history", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8 text-slate-500">Loading simulation history...</div>;
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-white border border-slate-200 p-8 text-center">
          <p className="text-slate-500 mb-4">Unable to load simulation history.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="inline-block px-5 py-2.5 bg-slate-900 text-white text-sm font-medium hover:bg-slate-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const filteredSimulations = simulations.filter(sim => {
    const des = designs[sim.design];
    const cli = climates[sim.climate];
    
    if (searchTerm && (!des || !des.name.toLowerCase().includes(searchTerm.toLowerCase()))) {
      return false;
    }
    
    if (climateFilter !== "All" && cli?.location_name !== climateFilter) {
      return false;
    }
    
    if (shapeFilter !== "All" && des?.shape !== shapeFilter) {
      return false;
    }
    
    return true;
  });

  const uniqueClimates = ["All", ...new Set(Object.values(climates).map(c => c.location_name))];
  const uniqueShapes = ["All", "rectangular", "a_frame", "dome"];

  return (
    <div className="p-8">
      <div className="mb-8">
        <p className="text-sm font-medium text-slate-500">THERMAOPT / HISTORY</p>
        <h2 className="text-3xl font-semibold text-slate-900 mt-2">Simulation History</h2>
        <p className="text-slate-500 mt-2">
          Review and analyze previously run thermal simulations.
        </p>
      </div>
      
      {simulations.length > 0 && (
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input 
            type="text" 
            placeholder="Search design name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-slate-300 px-3 py-2 text-sm bg-white md:w-64"
          />
          <select 
            value={climateFilter} 
            onChange={(e) => setClimateFilter(e.target.value)}
            className="border border-slate-300 px-3 py-2 text-sm bg-white"
          >
            {uniqueClimates.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select 
            value={shapeFilter} 
            onChange={(e) => setShapeFilter(e.target.value)}
            className="border border-slate-300 px-3 py-2 text-sm bg-white capitalize"
          >
            {uniqueShapes.map(s => <option key={s} value={s}>{s === "All" ? "All Shapes" : s.replace("_", "-")}</option>)}
          </select>
        </div>
      )}

      <div className="bg-white border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-6 py-3 font-medium">ID</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Date</th>
                <th className="px-6 py-3 font-medium">Design & Shape</th>
                <th className="px-6 py-3 font-medium">Climate</th>
                <th className="px-6 py-3 font-medium text-right">In. Temp (°C)</th>
                <th className="px-6 py-3 font-medium text-right">Heat Loss (W)</th>
                <th className="px-6 py-3 font-medium text-right">Solar Gain (W)</th>
                <th className="px-6 py-3 font-medium text-center">Status</th>
                <th className="px-6 py-3 font-medium text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSimulations.map((sim) => {
                const des = designs[sim.design];
                const cli = climates[sim.climate];
                const res = sim.result;
                
                const dateObj = new Date(sim.created_at);
                const dateStr = `${dateObj.getDate()} ${dateObj.toLocaleString('en-US', { month: 'short' })} ${dateObj.getFullYear()}, ${dateObj.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;

                return (
                  <tr key={sim.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-slate-500">#{sim.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">{dateStr}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{des?.name || "Unknown Design"}</div>
                      <div className="text-xs text-slate-500 capitalize">{des?.shape?.replace("_", "-")}</div>
                    </td>
                    <td className="px-6 py-4">{cli?.location_name || "Unknown"}</td>
                    <td className="px-6 py-4 text-right font-mono text-slate-700">{res ? Number(res.indoor_temperature_c).toFixed(1) : "--"}</td>
                    <td className="px-6 py-4 text-right font-mono text-slate-700">{res ? Number(res.heat_loss_w).toFixed(1) : "--"}</td>
                    <td className="px-6 py-4 text-right font-mono text-slate-700">{res ? Number(res.solar_heat_gain_w).toFixed(1) : "--"}</td>
                    <td className="px-6 py-4 text-center">
                      {res ? (
                        <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-emerald-100 text-emerald-800 whitespace-nowrap">
                          Result Available
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-800 whitespace-nowrap">
                          Result Unavailable
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {res ? (
                        <Link 
                          to={`/results/${sim.id}`}
                          className="text-indigo-600 hover:text-indigo-900 font-medium text-xs border border-indigo-200 px-3 py-1.5 rounded whitespace-nowrap"
                        >
                          View Results
                        </Link>
                      ) : (
                        <span className="text-slate-400 font-medium text-xs border border-slate-100 px-3 py-1.5 rounded whitespace-nowrap">
                          No Result
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              
              {simulations.length > 0 && filteredSimulations.length === 0 && (
                <tr>
                  <td colSpan="9" className="px-6 py-8 text-center text-slate-500">
                    No simulations match your filters.
                  </td>
                </tr>
              )}
              
              {simulations.length === 0 && (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center">
                    <p className="text-slate-500 mb-4 text-lg">No simulations yet</p>
                    <p className="text-slate-500 mb-6">
                      Create a shelter design and run a thermal simulation to see your results here.
                    </p>
                    <Link
                      to="/designer"
                      className="inline-block px-6 py-2.5 bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 rounded-sm"
                    >
                      Create Design
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
