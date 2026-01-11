
import React, { useState } from 'react';

interface Props {
  onGenerate: (ingredients: string) => void;
  isLoading: boolean;
}

const IngredientInput: React.FC<Props> = ({ onGenerate, isLoading }) => {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onGenerate(value);
    }
  };

  return (
    <div className="glass-card p-6 rounded-2xl shadow-2xl mb-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="ingredients" className="block text-sm font-semibold text-slate-300 mb-2">
            Welke ingrediënten heb je in huis?
          </label>
          <textarea
            id="ingredients"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="bijv. kipfilet, spinazie, knoflook, pasta..."
            className="w-full h-32 bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none"
            disabled={isLoading}
          />
          <p className="mt-2 text-xs text-slate-500 italic">
            Tip: hoe specifieker je bent, hoe lekkerder het resultaat!
          </p>
        </div>
        <button
          type="submit"
          disabled={isLoading || !value.trim()}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 ${
            isLoading || !value.trim() 
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
            : 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:shadow-lg hover:shadow-emerald-500/30'
          }`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Chef denkt na...
            </>
          ) : (
            'Genereer Recepten'
          )}
        </button>
      </form>
    </div>
  );
};

export default IngredientInput;
