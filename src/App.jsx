
import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function GymTracker() {
  const emptyForm = {
    day: "",
    group: "",
    exercise: "",
    warmupWeight: "",
    warmupReps: "",
    sets: [
      { weight: "", reps: "" },
      { weight: "", reps: "" },
      { weight: "", reps: "" },
      { weight: "", reps: "" }
    ],
    notes: ""
  };

  const [sessions, setSessions] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [routineTemplates, setRoutineTemplates] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [unit, setUnit] = useState("kg");

  useEffect(() => {
    const savedSessions = JSON.parse(localStorage.getItem("sessions") || "[]");
    const savedTemplates = JSON.parse(localStorage.getItem("routineTemplates") || "[]");
    const savedUnit = localStorage.getItem("unit") || "kg";
    setSessions(savedSessions);
    setRoutineTemplates(savedTemplates);
    setUnit(savedUnit);
  }, []);

  useEffect(() => {
    localStorage.setItem("sessions", JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem("routineTemplates", JSON.stringify(routineTemplates));
  }, [routineTemplates]);

  useEffect(() => {
    localStorage.setItem("unit", unit);
  }, [unit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSetChange = (index, field, value) => {
    const newSets = [...form.sets];
    newSets[index] = { ...newSets[index], [field]: value };
    setForm({ ...form, sets: newSets });
  };

  const calculate1RM = (weight, reps) => {
    const w = Number(weight);
    const r = Number(reps);
    if (!w || !r) return 0;
    return Math.round(w * (1 + r / 30));
  };

  const handleSubmit = () => {
    const best1RM = form.sets
      .map((s) => calculate1RM(s.weight, s.reps))
      .reduce((max, curr) => (curr > max ? curr : max), 0);

    const newSession = {
      ...form,
      unit,
      id: Date.now(),
      date: new Date().toISOString().split("T")[0],
      best1RM
    };

    setSessions([...sessions, newSession]);
    setForm(emptyForm);
  };

  const handleSaveRoutine = () => {
    setRoutineTemplates([...routineTemplates, form]);
  };

  const handleLoadRoutine = (tpl) => {
    setForm(tpl);
  };

  const filteredSessions = filterDate
    ? sessions.filter((s) => s.date === filterDate)
    : sessions;

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Registro de Entrenamiento</h1>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Unidad de Peso</label>
        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          className="border rounded px-2 py-1 w-full"
        >
          <option value="kg">Kilogramos (kg)</option>
          <option value="lb">Libras (lb)</option>
        </select>
      </div>

      <div className="mb-6 border rounded p-4 space-y-2">
        <input
          name="day"
          value={form.day}
          onChange={handleChange}
          placeholder="Día (ej: Lunes)"
          className="w-full border rounded p-2"
        />
        <input
          name="group"
          value={form.group}
          onChange={handleChange}
          placeholder="Grupo Muscular"
          className="w-full border rounded p-2"
        />
        <input
          name="exercise"
          value={form.exercise}
          onChange={handleChange}
          placeholder="Ejercicio"
          className="w-full border rounded p-2"
        />

        <div className="flex gap-2">
          <input
            name="warmupWeight"
            value={form.warmupWeight}
            onChange={handleChange}
            placeholder={`Peso Calentamiento (${unit})`}
            type="number"
            className="flex-1 border rounded p-2"
          />
          <input
            name="warmupReps"
            value={form.warmupReps}
            onChange={handleChange}
            placeholder="Reps Calentamiento"
            type="number"
            className="flex-1 border rounded p-2"
          />
        </div>

        {form.sets.map((set, idx) => (
          <div key={idx} className="flex gap-2">
            <input
              value={set.weight}
              onChange={(e) => handleSetChange(idx, "weight", e.target.value)}
              placeholder={`Serie ${idx + 1} - Peso (${unit})`}
              type="number"
              className="flex-1 border rounded p-2"
            />
            <input
              value={set.reps}
              onChange={(e) => handleSetChange(idx, "reps", e.target.value)}
              placeholder={`Serie ${idx + 1} - Reps`}
              type="number"
              className="flex-1 border rounded p-2"
            />
          </div>
        ))}

        <input
          name="notes"
          value={form.notes}
          onChange={handleChange}
          placeholder="Observaciones"
          className="w-full border rounded p-2"
        />

        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            className="flex-1 bg-indigo-600 text-white rounded p-2"
          >
            Guardar Sesión
          </button>
          <button
            onClick={handleSaveRoutine}
            className="flex-1 bg-gray-300 rounded p-2"
          >
            Guardar como Rutina
          </button>
        </div>
      </div>

      {routineTemplates.length > 0 && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Rutinas Guardadas</h2>
          <div className="space-y-2 mt-2">
            {routineTemplates.map((tpl, idx) => (
              <button
                key={idx}
                onClick={() => handleLoadRoutine(tpl)}
                className="w-full border rounded p-2 text-left bg-gray-100"
              >
                {tpl.exercise || "Rutina"} - {tpl.group}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mb-4">
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          placeholder="Filtrar por fecha"
          className="w-full border rounded p-2"
        />
      </div>

      <h2 className="text-xl font-semibold mb-2">Progreso</h2>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={filteredSessions}>
          <XAxis dataKey="exercise" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="best1RM" stroke="#4f46e5" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
