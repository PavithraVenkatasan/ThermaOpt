import { useEffect, useState } from "react";
import { getMaterials, getInsulation } from "../api/api";

export default function Materials() {
  const [materials, setMaterials] = useState([]);
  const [insulations, setInsulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [materialsRes, insulationsRes] = await Promise.all([
          getMaterials(),
          getInsulation(),
        ]);
        setMaterials(materialsRes.data);
        setInsulations(insulationsRes.data);
      } catch (err) {
        console.error("Error loading materials:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8 text-slate-500">Loading material library...</div>;
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-white border border-slate-200 p-8 text-center">
          <p className="text-slate-500 mb-4">Unable to load materials.</p>
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

  const filteredMaterials = materials.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredInsulations = insulations.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-8">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-8 gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">THERMAOPT / MATERIALS</p>
          <h2 className="text-3xl font-semibold text-slate-900 mt-2">Material Properties Library</h2>
          <p className="text-slate-500 mt-2 max-w-3xl">
            Reference database for construction and insulation materials used in thermal engine calculations.
          </p>
        </div>
        <div>
          <input 
            type="text" 
            placeholder="Search materials..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-slate-300 px-4 py-2 text-sm bg-white w-full sm:w-64 focus:outline-none focus:border-slate-500"
          />
        </div>
      </div>

      <div className="space-y-8">
        <div className="bg-white border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center flex-wrap gap-2">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Construction Materials</h3>
              <p className="text-sm text-slate-500 mt-1">
                Used for walls and roofs. High conductivity increases heat loss. High density and specific heat improve thermal mass.
              </p>
            </div>
            <div className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded">
              {filteredMaterials.length} {filteredMaterials.length === 1 ? 'material' : 'materials'}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="px-6 py-3 font-medium">Material Name</th>
                  <th className="px-6 py-3 font-medium text-right">
                    <abbr title="Indicates how readily heat passes through a material." className="cursor-help no-underline border-b border-dotted border-slate-400">Thermal Conductivity</abbr>
                    <div className="text-xs text-slate-400 font-normal">W/(m·K)</div>
                  </th>
                  <th className="px-6 py-3 font-medium text-right">
                    <abbr title="Mass contained in a unit volume and an important factor in thermal mass." className="cursor-help no-underline border-b border-dotted border-slate-400">Density</abbr>
                    <div className="text-xs text-slate-400 font-normal">kg/m³</div>
                  </th>
                  <th className="px-6 py-3 font-medium text-right">
                    <abbr title="Energy required to raise the temperature of a unit mass by 1°C." className="cursor-help no-underline border-b border-dotted border-slate-400">Specific Heat</abbr>
                    <div className="text-xs text-slate-400 font-normal">J/(kg·K)</div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMaterials.map((mat) => (
                  <tr key={mat.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{mat.name}</td>
                    <td className="px-6 py-4 text-right font-mono text-slate-700">{Number(mat.thermal_conductivity).toFixed(3)}</td>
                    <td className="px-6 py-4 text-right font-mono text-slate-700">{Number(mat.density).toFixed(1)}</td>
                    <td className="px-6 py-4 text-right font-mono text-slate-700">{Number(mat.specific_heat).toFixed(1)}</td>
                  </tr>
                ))}
                {filteredMaterials.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-slate-500">No construction materials available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center flex-wrap gap-2">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Insulation Materials</h3>
              <p className="text-sm text-slate-500 mt-1">
                Added to construction materials to increase thermal resistance.
              </p>
            </div>
            <div className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded">
              {filteredInsulations.length} {filteredInsulations.length === 1 ? 'material' : 'materials'}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="px-6 py-3 font-medium">Insulation Name</th>
                  <th className="px-6 py-3 font-medium text-right">
                    <abbr title="Thermal resistance; higher values indicate greater resistance to heat transfer." className="cursor-help no-underline border-b border-dotted border-slate-400">R-value</abbr>
                    <div className="text-xs text-slate-400 font-normal">per in</div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInsulations.map((ins) => (
                  <tr key={ins.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{ins.name}</td>
                    <td className="px-6 py-4 text-right font-mono text-slate-700">{Number(ins.r_value_per_inch).toFixed(2)}</td>
                  </tr>
                ))}
                {filteredInsulations.length === 0 && (
                  <tr>
                    <td colSpan="2" className="px-6 py-8 text-center text-slate-500">No insulation materials available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
