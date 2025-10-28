import React from 'react';

export default function CheckboxGroup({ label, options, selectedOptions, onChange }) {
  const handleCheckboxChange = (option) => {
    const newSelection = selectedOptions.includes(option)
      ? selectedOptions.filter((item) => item !== option)
      : [...selectedOptions, option];
    onChange(newSelection);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {options.map((option) => (
          <label key={option} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md border border-gray-200 hover:bg-gray-100 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedOptions.includes(option)}
              onChange={() => handleCheckboxChange(option)}
              className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-sm text-gray-800">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}