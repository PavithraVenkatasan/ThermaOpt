import { useEffect, useState } from "react";
import { getClimate, getSimulations } from "../api/api";
import MetricCard from "../components/MetricCard";

export default function Dashboard() {
  const [climate, setClimate] = useState([]);
  const [simulations, setSimulations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [climateResponse, simulationResponse] = await Promise.all([
          getClimate(),
          getSimulations(),
        ]);

        setClimate(climateResponse.data);
        setSimulations(simulationResponse.data);
      } catch (error) {
        console.error("Dashboard loading error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const latestSimulation =
    simulations.length > 0 ? simulations[0] : null;

  const result = latestSimulation?.result || latestSimulation;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm font-medium text-slate-500">
          THERMAOPT / DASHBOARD
        </p>

        <h2 className="text-3xl font-semibold text-slate-900 mt-2">
          Smart Passive Shelter Design
        </h2>

        <p className="text-slate-500 mt-2 max-w-3xl">
          Design and evaluate area-specific shelters using climate data,
          procedural 3D modeling, and simplified physics-based thermal
          analysis.
        </p>
      </div>

      {/* Status */}
      <div className="bg-white border border-slate-200 p-5 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">System Status</p>
            <p className="text-lg font-medium text-slate-900 mt-1">
              Backend Connected
            </p>
          </div>

          <div className="text-sm text-slate-500">
            {loading
              ? "Loading..."
              : `${climate.length} climate records available`}
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          title="Indoor Temperature"
          value={
            result?.indoor_temperature_c !== undefined
              ? result.indoor_temperature_c
              : "--"
          }
          unit="°C"
          description="Latest simulation"
        />

        <MetricCard
          title="Heat Loss"
          value={
            result?.heat_loss_w !== undefined
              ? result.heat_loss_w
              : "--"
          }
          unit="W"
          description="Envelope heat loss"
        />

        <MetricCard
          title="Solar Heat Gain"
          value={
            result?.solar_heat_gain_w !== undefined
              ? result.solar_heat_gain_w
              : "--"
          }
          unit="W"
          description="Estimated solar gain"
        />

        <MetricCard
          title="Thermal Comfort"
          value={
            result?.thermal_comfort_score !== undefined
              ? result.thermal_comfort_score
              : "--"
          }
          unit="/100"
          description="Latest comfort score"
        />
      </div>

      {/* Main action */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 p-6">
          <p className="text-sm text-slate-500">
            DESIGN WORKSPACE
          </p>

          <h3 className="text-xl font-semibold text-slate-900 mt-2">
            Configure a Passive Shelter
          </h3>

          <p className="text-sm text-slate-500 mt-3 leading-6">
            Select climate conditions, shelter geometry, construction
            materials, insulation and openings. The 3D model will respond
            to your design parameters.
          </p>

          <a
            href="/designer"
            className="inline-block mt-5 px-5 py-2.5 bg-slate-900 text-white text-sm hover:bg-slate-800"
          >
            Open Shelter Designer
          </a>
        </div>

        <div className="bg-white border border-slate-200 p-6">
          <p className="text-sm text-slate-500">
            ANALYSIS METHOD
          </p>

          <h3 className="text-xl font-semibold text-slate-900 mt-2">
            Simplified Physics-Based Model
          </h3>

          <p className="text-sm text-slate-500 mt-3 leading-6">
            ThermaOpt estimates heat transfer, solar gain, indoor
            temperature, heating requirement and thermal comfort from
            the selected design and climate inputs.
          </p>

          <div className="mt-5 border-l-2 border-slate-300 pl-4">
            <p className="text-xs text-slate-500">
              IMPORTANT
            </p>

            <p className="text-sm text-slate-700 mt-1">
              Results are simplified engineering estimates and are not
              CFD-level simulations.
            </p>
          </div>
        </div>
      </div>

      {/* Simulation information */}
      <div className="mt-6 bg-white border border-slate-200">
        <div className="p-5 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900">
            Simulation Status
          </h3>
        </div>

        <div className="p-5">
          {simulations.length === 0 ? (
            <p className="text-sm text-slate-500">
              No simulations available. Create a shelter design and run
              a thermal simulation.
            </p>
          ) : (
            <p className="text-sm text-slate-600">
              {simulations.length} simulation
              {simulations.length !== 1 ? "s" : ""} available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}