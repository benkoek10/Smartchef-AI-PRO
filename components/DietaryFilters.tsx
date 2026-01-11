
import React from 'react';
import { DietaryPreference } from '../types';

interface Props {
  selected: DietaryPreference[];
  onChange: (pref: DietaryPreference) => void;
}

const DIETARY_OPTIONS: DietaryPreference[] = ['Vegan', 'Vegetarisch', 'Glutenvrij', 'Koolhydraatarm'];

const DietaryFilters: React.FC<Props> = ({ selected, onChange }) => {
  return (
    <div className="space-y-3 mb-6">
      <p className="text-sm font-semibold text-slate-300">Dieetwensen</p>
      <div className="flex flex-wrap gap-2">
        {DIETARY_OPTIONS.map((opt) => {
          const isSelected = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                isSelected 
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/10' 
                : 'bg-slate-900/40 border-slate-700 text-slate-400 hover:border-slate-500'
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DietaryFilters;
