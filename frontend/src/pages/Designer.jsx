import { useEffect, useState } from "react";
import axios from "axios";
import ShelterViewer from "../components/3d/ShelterViewer";

const API_BASE = "http://127.0.0.1:8000/api";

export default function Designer() {
  // -------------------------
  // Design parameters
  // -------------------------
  const [type, setType] = useState("Rectangular");
  const [length, setLength] = useState(8);
  const [width, setWidth] = useState(5);
  const [height, setHeight] = useState(3);
  const [orientation, setOrientation] = useState("South");

  // -------------------------
  // Thermal inputs
  // -------------------------
  const [climates, setClimates] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [insulations, setInsulations] = useState([]);

  const [climateId, setClimateId] = useState("");
  const [wallMaterialId, setWallMaterialId] = useState("");
  const [roofMaterialId, setRoofMaterialId] = useState("");
  const [insulationId, setInsulationId] = useState("");

  const [insulationThickness, setInsulationThickness] = useState(2);
  const [windowArea, setWindowArea] = useState(2);
  const [doorArea, setDoorArea] = useState(2);

  // -------------------------
  // Status
  // -------------------------
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // -------------------------
  // Simulation result
  // -------------------------
  const [result, setResult] = useState(null);

  // -------------------------
  // Load backend data
  // -------------------------
  useEffect(() => {
    async function loadData() {
      try {
        const [climateRes, materialRes, insulationRes] =
          await Promise.all([
            axios.get(`${API_BASE}/climate/`),
            axios.get(`${API_BASE}/materials/`),
            axios.get(`${API_BASE}/insulation/`),
          ]);

        setClimates(climateRes.data);
        setMaterials(materialRes.data);
        setInsulations(insulationRes.data);

        if (climateRes.data.length > 0) {
          setClimateId(String(climateRes.data[0].id));
        }

        if (materialRes.data.length > 0) {
          setWallMaterialId(String(materialRes.data[0].id));
          setRoofMaterialId(String(materialRes.data[0].id));
        }

        if (insulationRes.data.length > 0) {
          setInsulationId(String(insulationRes.data[0].id));
        }
      } catch (error) {
        console.error(error);
        setMessage(
          "Unable to load climate, material or insulation data."
        );
      }
    }

    loadData();
  }, []);

  // -------------------------
  // Convert orientation
  // -------------------------
  const orientationDegrees = {
    North: 0,
    East: 90,
    South: 180,
    West: 270,
  };

  // -------------------------
  // Save design + simulate
  // -------------------------
  const runSimulation = async () => {
    setLoading(true);
    setMessage("");
    setResult(null);

    if (
      length === "" ||
      width === "" ||
      height === "" ||
      insulationThickness === "" ||
      windowArea === "" ||
      doorArea === ""
    ) {
      setMessage("Please fill in all numeric fields before running the simulation.");
      setLoading(false);
      return;
    }

    try {
      // 1. Create design
      const designPayload = {
        name: `${type} Shelter Design`,
        shape:
          type === "A-frame"
            ? "a_frame"
            : type === "Dome"
            ? "dome"
            : "rectangular",

        length: Number(length),
        width: Number(width),
        height: Number(height),

        orientation: orientationDegrees[orientation],

        wall_material: Number(wallMaterialId),
        roof_material: Number(roofMaterialId),

        insulation: insulationId
          ? Number(insulationId)
          : null,

        insulation_thickness: Number(insulationThickness),
        window_area: Number(windowArea),
        door_area: Number(doorArea),
      };

      const designResponse = await axios.post(
        `${API_BASE}/designs/`,
        designPayload
      );

      const designId = designResponse.data.id;

      // 2. Run thermal simulation
      const simulationResponse = await axios.post(
        `${API_BASE}/simulate/`,
        {
          climate_id: Number(climateId),
          design_id: designId,
        }
      );

      const simulationResult =
        simulationResponse.data.result;

      setResult(simulationResult);

      setMessage(
        "Thermal simulation completed successfully."
      );
    } catch (error) {
      console.error(error);

      const backendError =
        error.response?.data;

      setMessage(
        backendError
          ? JSON.stringify(backendError)
          : "Simulation failed. Please check the backend server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">

      {/* Header */}
      <div className="mb-6">
        <p className="text-sm font-medium text-slate-500">
          THERMAOPT / DESIGNER
        </p>

        <h1 className="text-3xl font-semibold text-slate-900 mt-2">
          Shelter Design Workspace
        </h1>

        <p className="text-slate-500 mt-2">
          Configure shelter geometry, construction materials and
          thermal parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

        {/* ======================================
            LEFT PANEL
        ====================================== */}
        <div className="xl:col-span-1 space-y-6">

          {/* Design Parameters */}
          <div className="bg-white border border-slate-200 p-5">

            <h2 className="font-semibold text-slate-900 mb-5">
              Design Parameters
            </h2>

            {/* Shelter Type */}
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Shelter Type
            </label>

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full border border-slate-300 px-3 py-2 mb-5 bg-white"
            >
              <option value="Rectangular">
                Rectangular
              </option>

              <option value="A-frame">
                A-frame
              </option>

              <option value="Dome">
                Dome
              </option>
            </select>

            {/* Length */}
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Length (m)
            </label>

            <input
              type="number"
              min="2"
              max="20"
              step="0.5"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              className="w-full border border-slate-300 px-3 py-2 mb-5"
            />

            {/* Width */}
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Width (m)
            </label>

            <input
              type="number"
              min="2"
              max="15"
              step="0.5"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              className="w-full border border-slate-300 px-3 py-2 mb-5"
            />

            {/* Height */}
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Height (m)
            </label>

            <input
              type="number"
              min="2"
              max="10"
              step="0.5"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full border border-slate-300 px-3 py-2 mb-5"
            />

            {/* Orientation */}
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Orientation
            </label>

            <select
              value={orientation}
              onChange={(e) =>
                setOrientation(e.target.value)
              }
              className="w-full border border-slate-300 px-3 py-2 mb-6 bg-white"
            >
              <option>North</option>
              <option>East</option>
              <option>South</option>
              <option>West</option>
            </select>

            <div className="border-t border-slate-200 pt-5">

              <p className="text-xs text-slate-500 uppercase">
                Current Configuration
              </p>

              <div className="mt-3 space-y-2 text-sm">

                <div className="flex justify-between">
                  <span className="text-slate-500">
                    Type
                  </span>

                  <span className="font-medium">
                    {type}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">
                    Dimensions
                  </span>

                  <span className="font-medium">
                    {length} × {width} × {height} m
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">
                    Orientation
                  </span>

                  <span className="font-medium">
                    {orientation}
                  </span>
                </div>

              </div>
            </div>

          </div>

          {/* Thermal Inputs */}
          <div className="bg-white border border-slate-200 p-5">

            <h2 className="font-semibold text-slate-900 mb-5">
              Thermal Inputs
            </h2>

            {/* Climate */}
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Climate Location
            </label>

            <select
              value={climateId}
              onChange={(e) =>
                setClimateId(e.target.value)
              }
              className="w-full border border-slate-300 px-3 py-2 mb-5 bg-white"
            >
              {climates.map((climate) => (
                <option
                  key={climate.id}
                  value={climate.id}
                >
                  {climate.location_name}
                </option>
              ))}
            </select>

            {/* Wall Material */}
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Wall Material
            </label>

            <select
              value={wallMaterialId}
              onChange={(e) =>
                setWallMaterialId(e.target.value)
              }
              className="w-full border border-slate-300 px-3 py-2 mb-5 bg-white"
            >
              {materials.map((material) => (
                <option
                  key={material.id}
                  value={material.id}
                >
                  {material.name}
                </option>
              ))}
            </select>

            {/* Roof Material */}
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Roof Material
            </label>

            <select
              value={roofMaterialId}
              onChange={(e) =>
                setRoofMaterialId(e.target.value)
              }
              className="w-full border border-slate-300 px-3 py-2 mb-5 bg-white"
            >
              {materials.map((material) => (
                <option
                  key={material.id}
                  value={material.id}
                >
                  {material.name}
                </option>
              ))}
            </select>

            {/* Insulation */}
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Insulation Material
            </label>

            <select
              value={insulationId}
              onChange={(e) =>
                setInsulationId(e.target.value)
              }
              className="w-full border border-slate-300 px-3 py-2 mb-5 bg-white"
            >
              <option value="">
                No Insulation
              </option>

              {insulations.map((insulation) => (
                <option
                  key={insulation.id}
                  value={insulation.id}
                >
                  {insulation.name}
                </option>
              ))}
            </select>

            {/* Insulation thickness */}
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Insulation Thickness (inch)
            </label>

            <input
              type="number"
              min="0"
              max="12"
              step="0.5"
              value={insulationThickness}
              onChange={(e) => setInsulationThickness(e.target.value)}
              className="w-full border border-slate-300 px-3 py-2 mb-5"
            />

            {/* Window area */}
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Window Area (m²)
            </label>

            <input
              type="number"
              min="0"
              max="20"
              step="0.5"
              value={windowArea}
              onChange={(e) => setWindowArea(e.target.value)}
              className="w-full border border-slate-300 px-3 py-2 mb-5"
            />

            {/* Door area */}
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Door Area (m²)
            </label>

            <input
              type="number"
              min="0"
              max="10"
              step="0.5"
              value={doorArea}
              onChange={(e) => setDoorArea(e.target.value)}
              className="w-full border border-slate-300 px-3 py-2 mb-6"
            />

            {/* Simulation button */}
            <button
              onClick={runSimulation}
              disabled={loading}
              className="w-full bg-slate-900 text-white px-4 py-3 text-sm font-medium hover:bg-slate-800 disabled:bg-slate-400"
            >
              {loading
                ? "Running Simulation..."
                : "Run Thermal Simulation"}
            </button>

            {message && (
              <div className="mt-4 p-3 border border-slate-200 bg-slate-50 text-xs text-slate-600 break-words">
                {message}
              </div>
            )}

          </div>

        </div>

        {/* ======================================
            RIGHT PANEL
        ====================================== */}
        <div className="xl:col-span-3">

          {/* 3D Viewer */}
          <div className="bg-white border border-slate-200">

            <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center">

              <div>
                <h2 className="font-semibold text-slate-900">
                  3D Shelter Visualization
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Interactive procedural model
                </p>
              </div>

              <span className="text-xs border border-slate-300 px-3 py-1 text-slate-600">
                {orientation} Facing
              </span>

            </div>

            <ShelterViewer
              type={type}
              length={length}
              width={width}
              height={height}
              orientation={orientation}
              wallMaterial={materials.find(m => m.id === Number(wallMaterialId))?.name || "Standard Wall"}
              roofMaterial={materials.find(m => m.id === Number(roofMaterialId))?.name || "Standard Roof"}
              insulation={insulationId ? (insulations.find(i => i.id === Number(insulationId))?.name || "None") : "None"}
              insulationThickness={insulationThickness}
              windowArea={windowArea}
              doorArea={doorArea}
            />

          </div>

          {/* Geometry information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">

            <div className="bg-white border border-slate-200 p-4">
              <p className="text-xs text-slate-500">
                GEOMETRY
              </p>

              <p className="font-medium mt-1">
                {type}
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-4">
              <p className="text-xs text-slate-500">
                FLOOR AREA
              </p>

              <p className="font-medium mt-1">
                {(length * width).toFixed(1)} m²
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-4">
              <p className="text-xs text-slate-500">
                VOLUME
              </p>

              <p className="font-medium mt-1">
                {(length * width * height).toFixed(1)} m³
              </p>
            </div>

          </div>

          {/* Thermal Results */}
          {result && (
            <div className="mt-6">

              <div className="bg-white border border-slate-200">

                <div className="px-5 py-4 border-b border-slate-200">

                  <h2 className="font-semibold text-slate-900">
                    Thermal Analysis Results
                  </h2>

                  <p className="text-xs text-slate-500 mt-1">
                    Calculated by the ThermaOpt thermal engine
                  </p>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-6">

                  <div className="p-5 border-b md:border-b-0 md:border-r border-slate-200">
                    <p className="text-xs text-slate-500">
                      INDOOR TEMPERATURE
                    </p>

                    <p className="text-2xl font-semibold text-slate-900 mt-2">
                      {Number(
                        result.indoor_temperature_c
                      ).toFixed(2)}
                      °C
                    </p>
                  </div>

                  <div className="p-5 border-b md:border-b-0 md:border-r border-slate-200">
                    <p className="text-xs text-slate-500">
                      HEAT LOSS
                    </p>

                    <p className="text-2xl font-semibold text-slate-900 mt-2">
                      {Number(
                        result.heat_loss_w
                      ).toFixed(2)}
                      W
                    </p>
                  </div>

                  <div className="p-5 border-b md:border-b-0 md:border-r border-slate-200">
                    <p className="text-xs text-slate-500">
                      SOLAR GAIN
                    </p>

                    <p className="text-2xl font-semibold text-slate-900 mt-2">
                      {Number(
                        result.solar_heat_gain_w
                      ).toFixed(2)}
                      W
                    </p>
                  </div>

                  <div className="p-5 border-b md:border-b-0 md:border-r border-slate-200">
                    <p className="text-xs text-slate-500">
                      HEATING REQUIREMENT
                    </p>

                    <p className="text-2xl font-semibold text-slate-900 mt-2">
                      {Number(
                        result.heating_requirement_kwh
                      ).toFixed(2)}
                      kWh
                    </p>
                  </div>

                  <div className="p-5">
                    <p className="text-xs text-slate-500">
                      THERMAL COMFORT
                    </p>

                    <p className="text-2xl font-semibold text-slate-900 mt-2">
                      {Number(
                        result.thermal_comfort_score
                      ).toFixed(1)}
                      /100
                    </p>
                  </div>

                  <div className="p-5 flex items-center justify-center border-t md:border-t-0 md:border-l border-slate-200">
                    <a
                      href="/results"
                      className="px-4 py-2 bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 text-center"
                    >
                      View Detailed Results
                    </a>
                  </div>

                </div>

              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}