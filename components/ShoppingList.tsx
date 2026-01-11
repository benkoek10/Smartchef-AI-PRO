
import React from 'react';
import { ShoppingItem } from '../types';

interface Props {
  items: ShoppingItem[];
  onToggle: (id: string) => void;
  onClear: () => void;
  onRemove: (id: string) => void;
}

const ShoppingList: React.FC<Props> = ({ items, onToggle, onClear, onRemove }) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-10 opacity-40">
        <div className="text-4xl mb-4">🛒</div>
        <p className="text-sm font-medium">Je lijstje is nog leeg.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400">Boodschappen</h3>
        <button 
          onClick={onClear}
          className="text-[10px] uppercase font-bold text-slate-500 hover:text-rose-400 transition-colors"
        >
          Alles wissen
        </button>
      </div>
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {items.map((item) => (
          <div 
            key={item.id}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
              item.checked 
              ? 'bg-slate-900/20 border-slate-800 opacity-50' 
              : 'bg-white/5 border-white/5 hover:border-emerald-500/30'
            }`}
          >
            <button 
              onClick={() => onToggle(item.id)}
              className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                item.checked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-700'
              }`}
            >
              {item.checked && <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>}
            </button>
            <div className="flex-grow min-w-0">
              <p className={`text-sm font-semibold truncate ${item.checked ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                {item.name}
              </p>
              {item.recipeTitle && (
                <p className="text-[10px] text-slate-500 truncate">voor: {item.recipeTitle}</p>
              )}
            </div>
            <button 
              onClick={() => onRemove(item.id)}
              className="text-slate-600 hover:text-rose-500 p-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShoppingList;
