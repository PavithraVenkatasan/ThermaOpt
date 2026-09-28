import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getSimulations,
  getSimulation,
  getDesigns,
  getClimate,
  getMaterials,
  getInsulation,
} from "../api/api";
import MetricCard from "../components/MetricCard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

export default function Results() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [simulation, setSimulation] = useState(null);
  const [design, setDesign] = useState(null);
  const [climate, setClimate] = useState(null);
  const [wallMaterial, setWallMaterial] = useState(null);
  const [roofMaterial, setRoofMaterial] = useState(null);
  const [insulation, setInsulation] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let simData = null;
        if (id) {
          const simRes = await getSimulation(id);
          simData = simRes.data;
        } else {
          const simsRes = await getSimulations();
          const sims = simsRes.data;
          if (sims.length > 0) {
            simData = sims.reduce((latest, current) => current.id > latest.id ? current : latest, sims[0]);
          }
        }
        if (simData) {
          const [
            designsRes,
            climatesRes,
            materialsRes,
            insulationsRes,
          ] = await Promise.all([
            getDesigns(),
            getClimate(),
            getMaterials(),
            getInsulation(),
          ]);

          setSimulation(simData);

          const des = designsRes.data.find((d) => d.id === simData.design);
          setDesign(des);

          const cli = climatesRes.data.find((c) => c.id === simData.climate);
          setClimate(cli);

          if (des) {
            setWallMaterial(
              materialsRes.data.find((m) => m.id === des.wall_material)
            );
            setRoofMaterial(
              materialsRes.data.find((m) => m.id === des.roof_material)
            );
            setInsulation(
              insulationsRes.data.find((i) => i.id === des.insulation)
            );
          }
        }
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 text-slate-500">
        Loading simulation results...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-white border border-slate-200 p-8 text-center">
          <p className="text-slate-500 mb-4">
            Unable to load simulation results. Please try again.
          </p>
          <Link
            to="/history"
            className="inline-block px-5 py-2.5 bg-slate-900 text-white text-sm font-medium hover:bg-slate-800"
          >
            Back to History
          </Link>
        </div>
      </div>
    );
  }

  if (!simulation || !simulation.result) {
    return (
      <div className="p-8">
        <div className="bg-white border border-slate-200 p-8 text-center">
          <p className="text-slate-500 mb-4">
            No simulation result is available.
          </p>
          <Link
            to="/designer"
            className="inline-block px-5 py-2.5 bg-slate-900 text-white text-sm font-medium hover:bg-slate-800"
          >
            Back to Designer
          </Link>
        </div>
      </div>
    );
  }

  const result = simulation.result;
  const isExtremeDesign = design && (design.window_area + design.door_area) > (design.length * design.width * 0.5);

  const energyData = [
    {
      name: "Energy Transfer",
      "Heat Loss (W)": result.heat_loss_w,
      "Solar Heat Gain (W)": result.solar_heat_gain_w,
    },
  ];

  const comfortScore = result.thermal_comfort_score;
  const comfortData = [
    { name: "Score", value: comfortScore },
    { name: "Remaining", value: 100 - comfortScore },
  ];
  const comfortColors = ["#10b981", "#e2e8f0"];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-8 gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            THERMAOPT / RESULTS
          </p>
          <h2 className="text-3xl font-semibold text-slate-900 mt-2">
            Simulation Results
          </h2>
          <p className="text-slate-500 mt-2 max-w-3xl">
            Detailed thermal performance and energy analysis of your latest design.
          </p>
        </div>
        <div className="flex gap-4">
          <Link
            to="/history"
            className="inline-block px-5 py-2.5 bg-white border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 whitespace-nowrap"
          >
            View History
          </Link>
          <Link
            to="/designer"
            className="inline-block px-5 py-2.5 bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 whitespace-nowrap"
          >
            Back to Designer
          </Link>
        </div>
      </div>

      {isExtremeDesign && (
        <div className="mb-8 p-4 bg-amber-50 border border-amber-200 text-amber-800 text-sm">
          <strong>Design Warning:</strong> The total opening area is unusually large compared with the floor area. Results may not represent a practical shelter configuration.
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
        <MetricCard
          title="Indoor Temperature"
          value={Number(result.indoor_temperature_c).toFixed(2)}
          unit="°C"
          description="Estimated indoor air temperature based on the selected climate and shelter design."
        />
        <MetricCard
          title="Heat Loss"
          value={Number(result.heat_loss_w).toFixed(2)}
          unit="W"
          description="Estimated heat transferred out of the shelter through the envelope and openings."
        />
        <MetricCard
          title="Solar Heat Gain"
          value={Number(result.solar_heat_gain_w).toFixed(2)}
          unit="W"
          description="Estimated solar heat entering the shelter based on the selected climate and design."
        />
        <MetricCard
          title="Heating Requirement"
          value={Number(result.heating_requirement_kwh).toFixed(2)}
          unit="kWh/day"
          description="Estimated heating energy required to maintain the target indoor condition."
        />
        <MetricCard
          title="Thermal Comfort"
          value={Number(result.thermal_comfort_score).toFixed(0)}
          unit="/ 100"
          description="Relative thermal comfort score calculated from the simulated indoor condition."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Thermal Performance Summary */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 p-6">
            <h3 className="text-xl font-semibold text-slate-900 mb-6">
              Thermal Performance Summary
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Bar Chart */}
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-4 text-center">
                  Energy Transfer Comparison
                </h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={energyData}
                      margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="Heat Loss (W)" fill="#ef4444" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="Solar Heat Gain (W)" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Comfort Gauge / Pie */}
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-4 text-center">
                  Thermal Comfort Score
                </h4>
                <div className="h-64 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={comfortData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        startAngle={180}
                        endAngle={0}
                        dataKey="value"
                        stroke="none"
                      >
                        {comfortData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={comfortColors[index]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
                    <span className="text-3xl font-semibold text-slate-900">
                      {Number(comfortScore).toFixed(0)}
                    </span>
                    <span className="text-xs text-slate-500 uppercase tracking-wider">
                      Score
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Design Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-5">
              Design Configuration
            </h3>

            {design && (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Design Name</span>
                  <span className="font-medium text-slate-900 text-right break-words ml-4">
                    {design.name}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Shelter type</span>
                  <span className="font-medium text-slate-900 capitalize">
                    {design.shape.replace("_", "-")}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Dimensions</span>
                  <span className="font-medium text-slate-900">
                    {design.length}m × {design.width}m × {design.height}m
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Orientation</span>
                  <span className="font-medium text-slate-900">
                    {design.orientation}°
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Wall material</span>
                  <span className="font-medium text-slate-900 text-right break-words ml-4">
                    {wallMaterial?.name || "None"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Roof material</span>
                  <span className="font-medium text-slate-900 text-right break-words ml-4">
                    {roofMaterial?.name || "None"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Insulation</span>
                  <span className="font-medium text-slate-900 text-right break-words ml-4">
                    {insulation?.name || "None"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Insulation thickness</span>
                  <span className="font-medium text-slate-900">
                    {design.insulation_thickness} inch
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Window area</span>
                  <span className="font-medium text-slate-900">
                    {design.window_area} m²
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">Door area</span>
                  <span className="font-medium text-slate-900">
                    {design.door_area} m²
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-5">
              Climate Conditions
            </h3>
            {climate && (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Climate</span>
                  <span className="font-medium text-slate-900">
                    {climate.location_name}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Average Temp</span>
                  <span className="font-medium text-slate-900">
                    {climate.avg_temperature_c} °C
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Solar Radiation</span>
                  <span className="font-medium text-slate-900">
                    {climate.solar_radiation_wm2} W/m²
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">Wind Speed</span>
                  <span className="font-medium text-slate-900">
                    {climate.wind_speed_ms} m/s
                  </span>
                </div>
              </div>
            )}
          </div>
          
          <div className="text-xs text-slate-500 text-center">
            Simulation generated:<br/>
            {new Intl.DateTimeFormat("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true
            }).format(new Date(simulation.created_at))}
          </div>

        </div>
      </div>
    </div>
  );
}
