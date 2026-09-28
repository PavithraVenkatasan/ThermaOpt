import { useEffect, useState } from "react";
import {
  getDesigns,
  getClimate,
  getMaterials,
  getInsulation,
  optimizeDesign,
} from "../api/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

export default function Optimization() {
  const [loading, setLoading] = useState(true);
  const [designs, setDesigns] = useState([]);
  const [climates, setClimates] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [insulations, setInsulations] = useState([]);

  const [baseDesignId, setBaseDesignId] = useState("");
  const [climateId, setClimateId] = useState("");
  
  const [variations, setVariations] = useState([]);
  const [varName, setVarName] = useState("");
  const [varWall, setVarWall] = useState("");
  const [varRoof, setVarRoof] = useState("");
  const [varInsulation, setVarInsulation] = useState("");
  const [varInsulThick, setVarInsulThick] = useState("");
  const [varOrientation, setVarOrientation] = useState("");
  const [validationError, setValidationError] = useState("");

  const [running, setRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [desRes, cliRes, matRes, insRes] = await Promise.all([
          getDesigns(),
          getClimate(),
          getMaterials(),
          getInsulation(),
        ]);
        setDesigns(desRes.data);
        setClimates(cliRes.data);
        setMaterials(matRes.data);
        setInsulations(insRes.data);

        if (desRes.data.length > 0) setBaseDesignId(String(desRes.data[0].id));
        if (cliRes.data.length > 0) setClimateId(String(cliRes.data[0].id));
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleBaseDesignChange = (e) => {
    setBaseDesignId(e.target.value);
    setResults(null);
  };

  const handleClimateChange = (e) => {
    setClimateId(e.target.value);
    setResults(null);
  };

  const handleAddVariation = () => {
    setValidationError("");
    if (!varName.trim()) {
      setValidationError("Please enter a variation name.");
      return;
    }
    if (varInsulThick !== "" && Number(varInsulThick) < 0) {
      setValidationError("Insulation thickness cannot be negative.");
      return;
    }
    if (varOrientation !== "" && (Number(varOrientation) < 0 || Number(varOrientation) > 360)) {
      setValidationError("Orientation must be between 0 and 360 degrees.");
      return;
    }

    const overrides = {};
    if (varWall) overrides.wall_material = Number(varWall);
    if (varRoof) overrides.roof_material = Number(varRoof);
    if (varInsulation) overrides.insulation = Number(varInsulation);
    if (varInsulThick !== "") overrides.insulation_thickness = Number(varInsulThick);
    if (varOrientation !== "") overrides.orientation = Number(varOrientation);

    setVariations([...variations, { name: varName.trim(), overrides }]);
    
    setVarName("");
    setVarWall("");
    setVarRoof("");
    setVarInsulation("");
    setVarInsulThick("");
    setVarOrientation("");
  };

  const handleRemoveVariation = (index) => {
    setVariations(variations.filter((_, i) => i !== index));
  };

  const handleClearVariations = () => {
    setVariations([]);
    setResults(null);
  };

  const runOptimization = async () => {
    setValidationError("");
    if (variations.length === 0) {
      setValidationError("Add at least one variation before running a comparison.");
      return;
    }

    setRunning(true);
    setErrorMsg("");
    setResults(null);
    try {
      const payload = {
        base_design_id: Number(baseDesignId),
        climate_id: Number(climateId),
        variations: [
          { name: "Base Design", overrides: {} },
          ...variations
        ]
      };
      const res = await optimizeDesign(payload);
      setResults(res.data.results);
    } catch (err) {
      console.error(err);
      setErrorMsg("Unable to run the thermal comparison. Please try again.");
    } finally {
      setRunning(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-slate-500">Loading optimization module...</div>;
  }

  const selectedDesign = designs.find(d => String(d.id) === baseDesignId);
  const selectedClimate = climates.find(c => String(c.id) === climateId);

  const getMatName = (id) => materials.find(m => m.id === id)?.name || "Unknown";
  const getInsName = (id) => insulations.find(i => i.id === id)?.name || "Unknown";

  const chartData = results ? results.filter(r => !r.error).map(r => ({
    name: r.configuration_name,
    "Heat Loss (W)": r.heat_loss_w,
    "Comfort (/100)": r.thermal_comfort_score,
    "Heating Req (kWh)": r.heating_requirement_kwh
  })) : [];

  const baseResult = results?.find(r => r.configuration_name === "Base Design");

  return (
    <div className="p-8">
      <div className="mb-8">
        <p className="text-sm font-medium text-slate-500">THERMAOPT / OPTIMIZE</p>
        <h2 className="text-3xl font-semibold text-slate-900 mt-2">What-If Analysis</h2>
        <p className="text-slate-500 mt-2 max-w-3xl">
          Evaluate multiple material and orientation permutations against a base design to find the lowest heating requirement and best thermal comfort.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900 mb-4">1. Select Base Condition</h3>
            
            <label className="block text-sm font-medium text-slate-700 mb-1">Base Design</label>
            <select
              value={baseDesignId}
              onChange={handleBaseDesignChange}
              className="w-full border border-slate-300 px-3 py-2 mb-4 bg-white"
            >
              {designs.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            {selectedDesign && (
              <div className="mb-4 bg-slate-50 p-3 text-xs text-slate-600 border border-slate-100">
                <strong>BASE DESIGN SUMMARY</strong><br/>
                Shape: <span className="capitalize">{selectedDesign.shape.replace("_", "-")}</span><br/>
                Dimensions: {selectedDesign.length}m × {selectedDesign.width}m × {selectedDesign.height}m<br/>
                Wall: {getMatName(selectedDesign.wall_material)}<br/>
                Roof: {getMatName(selectedDesign.roof_material)}<br/>
                Insulation: {selectedDesign.insulation ? getInsName(selectedDesign.insulation) : "None"}<br/>
                Thickness: {selectedDesign.insulation_thickness} in<br/>
                Orientation: {selectedDesign.orientation}°
              </div>
            )}

            <label className="block text-sm font-medium text-slate-700 mb-1">Climate Location</label>
            <select
              value={climateId}
              onChange={handleClimateChange}
              className="w-full border border-slate-300 px-3 py-2 bg-white"
            >
              {climates.map(c => <option key={c.id} value={c.id}>{c.location_name}</option>)}
            </select>
            {selectedClimate && (
              <div className="mt-2 bg-slate-50 p-3 text-xs text-slate-600 border border-slate-100">
                <strong>CLIMATE SUMMARY</strong><br/>
                Avg Temp: {selectedClimate.avg_temperature_c}°C<br/>
                Solar Radiation: {selectedClimate.solar_radiation_wm2} W/m²<br/>
                Wind Speed: {selectedClimate.wind_speed_ms} m/s
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900 mb-4">2. Add What-If Variation</h3>
            <p className="text-xs text-slate-500 mb-4">Leave fields blank to inherit from the base design.</p>
            
            <label className="block text-xs font-medium text-slate-700 mb-1">Variation Name *</label>
            <input 
              type="text" 
              value={varName} 
              onChange={e => setVarName(e.target.value)}
              placeholder="e.g. Added Insulation"
              className="w-full border border-slate-300 px-3 py-2 mb-3 text-sm"
            />

            <label className="block text-xs font-medium text-slate-700 mb-1">Wall Material Override</label>
            <select value={varWall} onChange={e => setVarWall(e.target.value)} className="w-full border border-slate-300 px-3 py-2 mb-3 text-sm bg-white">
              <option value="">(Inherit Base)</option>
              {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>

            <label className="block text-xs font-medium text-slate-700 mb-1">Roof Material Override</label>
            <select value={varRoof} onChange={e => setVarRoof(e.target.value)} className="w-full border border-slate-300 px-3 py-2 mb-3 text-sm bg-white">
              <option value="">(Inherit Base)</option>
              {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>

            <label className="block text-xs font-medium text-slate-700 mb-1">Insulation Override</label>
            <select value={varInsulation} onChange={e => setVarInsulation(e.target.value)} className="w-full border border-slate-300 px-3 py-2 mb-3 text-sm bg-white">
              <option value="">(Inherit Base)</option>
              {insulations.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>

            <label className="block text-xs font-medium text-slate-700 mb-1">Insulation Thick. Override (inch)</label>
            <input type="number" step="0.5" min="0" value={varInsulThick} onChange={e => setVarInsulThick(e.target.value)} placeholder="(Inherit Base)" className="w-full border border-slate-300 px-3 py-2 mb-3 text-sm" />

            <label className="block text-xs font-medium text-slate-700 mb-1">Orientation Override (deg)</label>
            <input type="number" step="1" min="0" max="360" value={varOrientation} onChange={e => setVarOrientation(e.target.value)} placeholder="(Inherit Base)" className="w-full border border-slate-300 px-3 py-2 mb-4 text-sm" />

            <button onClick={handleAddVariation} className="w-full bg-slate-200 text-slate-800 px-4 py-2 text-sm font-medium hover:bg-slate-300 transition-colors">
              Add Variation
            </button>
          </div>

          <div className="bg-white border border-slate-200 p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-slate-900">3. Current Variations</h3>
              {variations.length > 0 && (
                <button onClick={handleClearVariations} className="text-xs text-red-600 hover:text-red-800">Clear</button>
              )}
            </div>
            
            {variations.length === 0 ? (
              <p className="text-sm text-slate-500 mb-4">No variations added. Add at least one variation to run comparison.</p>
            ) : (
              <div className="space-y-3 mb-5">
                {variations.map((v, idx) => (
                  <div key={idx} className="border border-slate-200 p-3 bg-slate-50 relative">
                    <button onClick={() => handleRemoveVariation(idx)} className="absolute top-3 right-3 text-xs text-red-500 hover:text-red-700 font-medium">Remove</button>
                    <p className="font-medium text-slate-800 text-sm pr-12">{v.name}</p>
                    <div className="mt-2 text-xs text-slate-600 grid grid-cols-2 gap-1">
                      <div>Wall: {v.overrides.wall_material ? getMatName(v.overrides.wall_material) : "Inherited"}</div>
                      <div>Roof: {v.overrides.roof_material ? getMatName(v.overrides.roof_material) : "Inherited"}</div>
                      <div>Insulation: {v.overrides.insulation ? getInsName(v.overrides.insulation) : "Inherited"}</div>
                      <div>Thick: {v.overrides.insulation_thickness !== undefined ? `${v.overrides.insulation_thickness} in` : "Inherited"}</div>
                      <div className="col-span-2">Orientation: {v.overrides.orientation !== undefined ? `${v.overrides.orientation}°` : "Inherited"}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {validationError && <div className="p-3 mb-4 bg-amber-50 border border-amber-200 text-amber-800 text-sm">{validationError}</div>}
            
            <button 
              onClick={runOptimization} 
              disabled={running || !baseDesignId}
              className="w-full bg-slate-900 text-white px-4 py-3 text-sm font-medium hover:bg-slate-800 disabled:bg-slate-400 transition-colors"
            >
              {running ? "Analyzing design variations..." : "Run Comparison"}
            </button>
            {errorMsg && <div className="p-3 mt-4 bg-red-50 border border-red-200 text-red-800 text-sm">{errorMsg}</div>}
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="xl:col-span-2">
          {!results ? (
             <div className="bg-white border border-slate-200 p-8 text-center text-slate-500 h-full flex flex-col items-center justify-center min-h-[400px]">
               <p className="text-lg font-medium text-slate-600 mb-2">No comparison results yet</p>
               <p>Add one or more design variations on the left, <br/>then run the comparison to evaluate thermal performance.</p>
             </div>
          ) : (
            <div className="space-y-6">
              
              <div className="bg-white border border-slate-200">
                <div className="px-5 py-4 border-b border-slate-200">
                  <h3 className="font-semibold text-slate-900">Detailed Results Table</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                      <tr>
                        <th className="px-5 py-3 font-medium">Design / Variation</th>
                        <th className="px-5 py-3 font-medium text-right">In. Temp (°C)</th>
                        <th className="px-5 py-3 font-medium text-right">Heat Loss (W)</th>
                        <th className="px-5 py-3 font-medium text-right">Solar Gain (W)</th>
                        <th className="px-5 py-3 font-medium text-right">Heating (kWh/day)</th>
                        <th className="px-5 py-3 font-medium text-right">Comfort</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {results.map((r, i) => {
                        if (r.error) {
                          return (
                            <tr key={i} className="bg-red-50">
                              <td className="px-5 py-4 font-medium text-slate-900">{r.configuration_name}</td>
                              <td colSpan="5" className="px-5 py-4 text-red-600 text-center text-sm">Result unavailable</td>
                            </tr>
                          );
                        }
                        
                        const isBase = r.configuration_name === "Base Design";
                        
                        const diffTemp = !isBase && baseResult ? (r.indoor_temperature_c - baseResult.indoor_temperature_c).toFixed(2) : null;
                        const diffLoss = !isBase && baseResult ? (r.heat_loss_w - baseResult.heat_loss_w).toFixed(2) : null;
                        const diffSolar = !isBase && baseResult ? (r.solar_heat_gain_w - baseResult.solar_heat_gain_w).toFixed(2) : null;
                        const diffHeat = !isBase && baseResult ? (r.heating_requirement_kwh - baseResult.heating_requirement_kwh).toFixed(2) : null;
                        const diffComfort = !isBase && baseResult ? (r.thermal_comfort_score - baseResult.thermal_comfort_score).toFixed(0) : null;

                        return (
                          <tr key={i} className={isBase ? "bg-slate-50 border-b-2 border-slate-200" : "hover:bg-slate-50"}>
                            <td className="px-5 py-4">
                              <div className="font-medium text-slate-900">{r.configuration_name}</div>
                              {isBase && <span className="inline-block mt-1 bg-slate-200 text-slate-700 text-[10px] px-2 py-0.5 rounded font-medium">REFERENCE</span>}
                            </td>
                            <td className="px-5 py-4 text-right">
                              <div className="font-mono text-slate-700">{Number(r.indoor_temperature_c).toFixed(2)}</div>
                              {!isBase && diffTemp && <div className={`text-xs mt-1 ${diffTemp > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>{diffTemp > 0 ? '+' : ''}{diffTemp} vs base</div>}
                            </td>
                            <td className="px-5 py-4 text-right">
                              <div className="font-mono text-slate-700">{Number(r.heat_loss_w).toFixed(2)}</div>
                              {!isBase && diffLoss && <div className={`text-xs mt-1 ${diffLoss > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>{diffLoss > 0 ? '+' : ''}{diffLoss} vs base</div>}
                            </td>
                            <td className="px-5 py-4 text-right">
                              <div className="font-mono text-slate-700">{Number(r.solar_heat_gain_w).toFixed(2)}</div>
                              {!isBase && diffSolar && <div className={`text-xs mt-1 ${diffSolar > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{diffSolar > 0 ? '+' : ''}{diffSolar} vs base</div>}
                            </td>
                            <td className="px-5 py-4 text-right">
                              <div className="font-mono font-medium text-slate-900">{Number(r.heating_requirement_kwh).toFixed(2)}</div>
                              {!isBase && diffHeat && <div className={`text-xs mt-1 ${diffHeat > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>{diffHeat > 0 ? '+' : ''}{diffHeat} vs base</div>}
                            </td>
                            <td className="px-5 py-4 text-right">
                              <div className="inline-block bg-slate-100 px-2 py-1 rounded font-medium text-slate-700">
                                {Number(r.thermal_comfort_score).toFixed(0)}
                              </div>
                              {!isBase && diffComfort && <div className={`text-xs mt-1 ${diffComfort > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{diffComfort > 0 ? '+' : ''}{diffComfort} pts vs base</div>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {chartData.length > 0 && (
                <div className="bg-white border border-slate-200 p-5">
                  <h4 className="text-base font-semibold text-slate-700 mb-6 text-center">Heating Requirement by Design (kWh/day)</h4>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{fontSize: 12}} interval={0} />
                        <YAxis tick={{fontSize: 12}} />
                        <RechartsTooltip cursor={{fill: '#f1f5f9'}} />
                        <Bar dataKey="Heating Req (kWh)" fill="#0f172a" radius={[2, 2, 0, 0]} barSize={50} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
