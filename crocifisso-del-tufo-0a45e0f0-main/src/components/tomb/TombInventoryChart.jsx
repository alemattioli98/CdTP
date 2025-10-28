import React, { useState, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts";
import { PieChart as PieChartIcon, BarChart3, Package } from "lucide-react";

export default function TombInventoryChart({ artifacts }) {
  const [chartType, setChartType] = useState("class_type");
  const [viewMode, setViewMode] = useState("pie");

  const chartData = useMemo(() => {
    if (!artifacts || artifacts.length === 0) return [];
    const groupBy = (array, key) => {
      return array.reduce((result, item) => {
        const group = item[key] || 'Non specificato';
        result[group] = (result[group] || 0) + 1;
        return result;
      }, {});
    };

    const grouped = groupBy(artifacts, chartType);

    return Object.entries(grouped)
      .map(([key, value]) => ({
        name: key,
        value: value,
        percentage: ((value / artifacts.length) * 100).toFixed(1)
      }))
      .sort((a, b) => b.value - a.value);
  }, [artifacts, chartType]);

  const COLORS = [
    '#3b82f6', '#8b5cf6', '#ec4899', '#f97316', 
    '#10b981', '#f59e0b', '#6366f1', '#ef4444',
    '#22c55e', '#06b6d4', '#d946ef', '#64748b'
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-lg text-sm">
          <p className="font-bold text-gray-900">{data.name}</p>
          <p className="text-gray-600">{`Quantità: ${data.value}`}</p>
          <p className="text-gray-600">{`Percentuale: ${data.percentage}%`}</p>
        </div>
      );
    }
    return null;
  };
  
  const ChartView = () => {
      if(viewMode === 'pie') {
          return (
             <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" dataKey="value" nameKey="name">
                  {chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )
      }
      return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <XAxis dataKey="name" tick={{fontSize: 12}} interval={0} angle={-35} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value">
                    {chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                </Bar>
            </BarChart>
          </ResponsiveContainer>
      )
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
                 <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3 mb-2">
                    <PieChartIcon className="w-7 h-7 text-blue-600" />
                    Analisi Corredo
                 </h2>
                 <p className="text-gray-600">Ripartizione dei reperti trovati nella tomba.</p>
            </div>
            <div className="flex-shrink-0 flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
                <button onClick={() => setViewMode('pie')} className={`px-3 py-1 text-sm font-medium rounded-md ${viewMode === 'pie' ? 'bg-white shadow-sm' : ''}`}><PieChartIcon className="w-5 h-5 inline-block" /></button>
                <button onClick={() => setViewMode('bar')} className={`px-3 py-1 text-sm font-medium rounded-md ${viewMode === 'bar' ? 'bg-white shadow-sm' : ''}`}><BarChart3 className="w-5 h-5 inline-block" /></button>
            </div>
        </div>

        <div>
            <div className="mb-4">
                <label htmlFor="chartType" className="sr-only">Raggruppa per</label>
                <select
                  id="chartType"
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value)}
                  className="w-full md:w-auto bg-white px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="class_type">Raggruppa per Classe</option>
                  <option value="shape">Raggruppa per Forma</option>
                  <option value="object_type">Raggruppa per Oggetto</option>
                  <option value="conservation_status">Raggruppa per Stato</option>
                </select>
            </div>

            {artifacts.length > 0 ? (
                <ChartView />
            ) : (
                <div className="h-72 flex flex-col items-center justify-center text-center text-gray-500">
                    <Package className="w-12 h-12 mb-2" />
                    <p className="font-medium">Nessun reperto da analizzare.</p>
                    <p className="text-sm">Aggiungi reperti a questa tomba per vedere i grafici.</p>
                </div>
            )}
        </div>
    </div>
  );
}