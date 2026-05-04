import { useState, useEffect } from "react";
import { ClipLoader } from "react-spinners";

import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  ResponsiveContainer,
} from "recharts";

const Prediction = () => {
  const [username, setUsername] = useState("");

  const [formData, setFormData] = useState({
    Age: "",
    Sex: "",
    ChestPainType: "",
    RestingBP: "",
    Cholesterol: "",
    FastingBS: "",
    RestingECG: "",
    MaxHR: "",
    ExerciseAngina: "",
    Oldpeak: "",
    ST_Slope: "",
  });

  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [chatResponse, setChatResponse] = useState("");
  const [loading, setLoading] = useState(false);

  // ================= LOAD FROM LOCAL STORAGE =================
  useEffect(() => {
    const savedName = localStorage.getItem("username");
    if (savedName) setUsername(savedName);

    const savedHistory = localStorage.getItem("history");
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  // ================= SAVE =================
  useEffect(() => {
    localStorage.setItem("username", username);
  }, [username]);

  useEffect(() => {
    localStorage.setItem("history", JSON.stringify(history));
  }, [history]);

  // ================= INPUT =================
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ================= PREDICT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username) {
      alert("Please enter your name");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          Age: Number(formData.Age),
          RestingBP: Number(formData.RestingBP),
          Cholesterol: Number(formData.Cholesterol),
          FastingBS: Number(formData.FastingBS),
          MaxHR: Number(formData.MaxHR),
          Oldpeak: Number(formData.Oldpeak),
        }),
      });

      const data = await res.json();

      setResult(data);
      setChatResponse(data.suggestions);

      // store locally
      setHistory((prev) => [...prev, data]);
    } catch (err) {
      console.error(err);
      alert("Error connecting to backend");
    }

    setLoading(false);
  };

  // ================= CHART DATA =================
  const chartData = history.map((h, i) => ({
    name: `T${i + 1}`,
    risk: h.prediction,
  }));

  const pieData = [
    {
      name: "High Risk",
      value: history.filter((h) => h.prediction === 1).length,
    },
    {
      name: "Low Risk",
      value: history.filter((h) => h.prediction === 0).length,
    },
  ];

  const COLORS = ["#ef4444", "#22c55e"];
  const total = history.length || 1;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ================= LEFT FORM ================= */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="sticky top-4 bg-gray-900 border border-gray-800 p-4 rounded-xl">
            <h2 className="text-blue-400 font-bold mb-3">🫀 Prediction Form</h2>

            <form onSubmit={handleSubmit} className="space-y-2">
              {/* USERNAME */}
              <input
                placeholder="Enter your name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 bg-black/40 rounded border border-gray-700"
              />

              <input
                name="Age"
                placeholder="Age"
                onChange={handleChange}
                className="w-full p-2 bg-black/40 rounded border border-gray-700"
              />

              <select
                name="Sex"
                onChange={handleChange}
                className="w-full p-2 bg-black/40 rounded border border-gray-700"
              >
                <option value="">Sex</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>

              <select
                name="ChestPainType"
                onChange={handleChange}
                className="w-full p-2 bg-black/40 rounded border border-gray-700"
              >
                <option value="">Chest Pain</option>
                <option value="ATA">ATA</option>
                <option value="NAP">NAP</option>
                <option value="ASY">ASY</option>
                <option value="TA">TA</option>
              </select>

              <input
                name="RestingBP"
                placeholder="BP"
                onChange={handleChange}
                className="w-full p-2 bg-black/40 rounded border"
              />
              <input
                name="Cholesterol"
                placeholder="Cholesterol"
                onChange={handleChange}
                className="w-full p-2 bg-black/40 rounded border"
              />
              <input
                name="MaxHR"
                placeholder="Max HR"
                onChange={handleChange}
                className="w-full p-2 bg-black/40 rounded border"
              />
              <input
                name="Oldpeak"
                placeholder="Oldpeak"
                onChange={handleChange}
                className="w-full p-2 bg-black/40 rounded border"
              />

              <button
                disabled={loading}
                className="w-full bg-blue-500 p-2 rounded mt-2"
              >
                {loading ? <ClipLoader size={16} /> : "Predict"}
              </button>
            </form>

            {result && (
              <div className="mt-3 p-2 bg-black/40 rounded text-sm">
                Result:{" "}
                <span
                  className={
                    result.prediction ? "text-red-400" : "text-green-400"
                  }
                >
                  {result.prediction ? "High Risk" : "Low Risk"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ================= RIGHT DASHBOARD ================= */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          {/* USER */}
          <div className="bg-gray-900 p-3 rounded-xl border border-gray-800">
            👋 Welcome{" "}
            <span className="text-blue-400 font-bold">
              {username || "Guest"}
            </span>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-gray-900 p-3 rounded">
              Total: {history.length}
            </div>
            <div className="bg-gray-900 p-3 rounded text-red-400">
              High: {pieData[0].value}
            </div>
            <div className="bg-gray-900 p-3 rounded text-green-400">
              Low: {pieData[1].value}
            </div>
          </div>

          {/* CHARTS */}
          <div className="grid grid-cols-2 gap-3">
            {/* LINE */}
            <div className="bg-gray-900 p-3 rounded h-56">
              <h3 className="text-blue-400 text-sm mb-1">Trend</h3>
              <ResponsiveContainer width="100%" height="90%">
                <LineChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RTooltip />
                  <Line dataKey="risk" stroke="#3b82f6" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* PIE */}
            <div className="bg-gray-900 p-3 rounded h-56 flex flex-col">
              <h3 className="text-blue-400 text-sm mb-2">Risk Distribution</h3>

              <div className="flex flex-1">
                <div className="w-2/3 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        outerRadius={60}
                        innerRadius={35}
                        paddingAngle={4}
                        label={({ percent }) =>
                          `${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i]} />
                        ))}
                      </Pie>
                      <RTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="w-1/3 text-xs space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                    High
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    Low
                  </div>

                  <div className="mt-3 text-[10px] text-gray-400">
                    Risk distribution based on all predictions.
                  </div>

                  <div className="mt-2 p-2 bg-black/40 rounded text-center">
                    <p className="text-[10px] text-gray-400">High Risk %</p>
                    <p className="text-sm font-bold">
                      {Math.round((pieData[0].value / total) * 100)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI */}
          <div className="bg-gray-900 p-3 rounded-xl border border-gray-800">
            <h3 className="text-blue-400 mb-2">🤖 AI Insight</h3>

            <div className="max-h-60 overflow-y-auto space-y-2 text-sm">
              {chatResponse ? (
                chatResponse.split("\n").map((line, i) => (
                  <div key={i} className="bg-black/40 p-2 rounded">
                    {line}
                  </div>
                ))
              ) : (
                <p className="text-gray-400">Run prediction to see analysis</p>
              )}
            </div>
          </div>

          {/* HISTORY */}
          <div className="bg-gray-900 p-3 rounded-xl max-h-40 overflow-y-auto">
            <h3 className="text-blue-400 mb-2">📜 History</h3>

            {history.length === 0 ? (
              <p className="text-gray-500">No records</p>
            ) : (
              history.map((h, i) => (
                <div key={i} className="flex justify-between text-sm p-1">
                  <span>Test {i + 1}</span>
                  <span
                    className={h.prediction ? "text-red-400" : "text-green-400"}
                  >
                    {h.prediction ? "High" : "Low"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Prediction;
