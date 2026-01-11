
import React, { useState } from 'react';
import { Recipe } from '../types';

interface Props {
  recipe: Recipe;
  onToggleFavorite?: (id: string) => void;
  isFavorite?: boolean;
  onAddAllToShoppingList?: (recipe: Recipe) => void;
}

const RecipeCard: React.FC<Props> = ({ recipe, onToggleFavorite, isFavorite, onAddAllToShoppingList }) => {
  const [copied, setCopied] = useState(false);
  const [addedItems, setAddedItems] = useState(false);

  const copyToClipboard = () => {
    const text = `
🍳 ${recipe.title}
${recipe.description}

⏱️ Tijd: ${recipe.prepTime} | 👨‍🍳 Niveau: ${recipe.difficulty}

🛒 Ingrediënten:
${recipe.ingredients.map(i => `• ${i}`).join('\n')}

👨‍🍳 Bereiding:
${recipe.instructions.map((s, i) => `${i + 1}. ${s}`).join('\n')}

💡 Tip van de Chef:
${recipe.chefTip}

🔥 Voedingswaarde:
- Calorieën: ${recipe.nutrition?.calories}
- Eiwit: ${recipe.nutrition?.protein}
- Koolhydraten: ${recipe.nutrition?.carbs}
- Vet: ${recipe.nutrition?.fat}

Gemaakt met SmartChef AI Pro
    `.trim();
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddToShoppingList = () => {
    if (onAddAllToShoppingList) {
      onAddAllToShoppingList(recipe);
      setAddedItems(true);
      setTimeout(() => setAddedItems(false), 2000);
    }
  };

  return (
    <div className="glass-card rounded-[2.5rem] overflow-hidden shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 border border-white/5 flex flex-col h-full group">
      <div className="relative h-72 bg-slate-900 overflow-hidden">
        {recipe.imageUrl ? (
          <img 
            src={recipe.imageUrl} 
            alt={recipe.title} 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-700 gap-4">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-slate-800 border-t-emerald-500 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-lg">👩‍🍳</div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">AI Fine Dining...</span>
          </div>
        )}
        
        <div className="absolute inset-0 recipe-gradient opacity-90" />
        
        <div className="absolute top-6 right-6 flex gap-2">
           <button 
             onClick={() => onToggleFavorite?.(recipe.id)}
             className={`p-3 backdrop-blur-xl rounded-2xl transition-all duration-300 shadow-lg border border-white/10 ${
               isFavorite ? 'bg-rose-500 text-white scale-110' : 'bg-black/40 text-white hover:bg-rose-500/50'
             }`}
             title="Bewaar recept"
           >
             <svg className="w-5 h-5" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
             </svg>
           </button>
           <button 
             onClick={copyToClipboard}
             className="p-3 bg-black/40 backdrop-blur-xl rounded-2xl text-white hover:bg-emerald-500 transition-all duration-300 shadow-lg border border-white/10"
             title="Kopieer recept"
           >
             {copied ? (
               <svg className="w-5 h-5 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
             ) : (
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
             )}
           </button>
        </div>

        <div className="absolute bottom-6 left-8 right-8">
          <div className="flex gap-2 mb-4">
            <span className="px-3 py-1 bg-emerald-500 text-[10px] uppercase tracking-widest font-black text-white rounded-full shadow-lg shadow-emerald-500/30">
              {recipe.difficulty}
            </span>
            <span className="px-3 py-1 bg-white/10 backdrop-blur-md text-[10px] uppercase tracking-widest font-black text-white rounded-full border border-white/20">
              {recipe.prepTime}
            </span>
          </div>
          <h3 className="text-3xl font-black text-white leading-none tracking-tight drop-shadow-2xl">{recipe.title}</h3>
        </div>
      </div>
      
      <div className="p-8 space-y-10 flex-grow">
        <p className="text-slate-400 text-sm leading-relaxed font-medium italic">
          "{recipe.description}"
        </p>

        {recipe.chefTip && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-[2rem] flex gap-4 transform transition-transform hover:scale-[1.02]">
             <span className="text-2xl animate-bounce">💡</span>
             <p className="text-xs text-emerald-300 font-semibold leading-relaxed">
               <span className="uppercase font-black block mb-1 text-[10px] tracking-widest opacity-60">Tip van de Chef</span>
               {recipe.chefTip}
             </p>
          </div>
        )}

        <div className="space-y-5">
          <div className="flex justify-between items-center">
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-black text-emerald-400 flex items-center gap-3">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              Ingrediënten
            </h4>
            <button 
              onClick={handleAddToShoppingList}
              className={`text-[10px] font-black uppercase tracking-widest py-1.5 px-3 rounded-xl border transition-all ${
                addedItems 
                ? 'bg-emerald-500 border-emerald-500 text-white' 
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-emerald-500 hover:text-emerald-400'
              }`}
            >
              {addedItems ? 'Toegevoegd! 🛒' : '+ Lijstje'}
            </button>
          </div>
          <ul className="grid grid-cols-1 gap-3">
            {recipe.ingredients.map((ing, idx) => (
              <li key={idx} className="text-slate-300 text-sm flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/5 hover:border-emerald-500/20 transition-all">
                <span className="text-emerald-500 font-bold text-xl leading-none">·</span>
                <span className="font-semibold">{ing}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-6">
          <h4 className="text-[10px] uppercase tracking-[0.3em] font-black text-emerald-400 flex items-center gap-3">
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
            Stappenplan
          </h4>
          <div className="space-y-8">
            {recipe.instructions.map((step, idx) => (
              <div key={idx} className="relative flex gap-5">
                <div className="flex-shrink-0 z-10">
                   <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 text-white text-xs flex items-center justify-center font-black border border-white/10 shadow-2xl transition-transform hover:scale-110">
                    {idx + 1}
                   </div>
                   {idx < recipe.instructions.length - 1 && (
                     <div className="absolute top-11 bottom-[-32px] left-[20px] w-[2px] bg-gradient-to-b from-slate-800 to-transparent" />
                   )}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed font-semibold pt-2">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {recipe.nutrition && (
          <div className="grid grid-cols-4 gap-3 bg-slate-900/60 p-4 rounded-3xl border border-white/5">
            {[
              { l: 'kcal', v: recipe.nutrition.calories, c: 'text-emerald-400' },
              { l: 'eiwit', v: recipe.nutrition.protein, c: 'text-blue-400' },
              { l: 'koolh', v: recipe.nutrition.carbs, c: 'text-orange-400' },
              { l: 'vet', v: recipe.nutrition.fat, c: 'text-rose-400' }
            ].map(n => (
              <div key={n.l} className="text-center">
                <p className="text-[8px] uppercase font-black text-slate-500 mb-1 tracking-tighter">{n.l}</p>
                <p className={`text-xs font-black ${n.c}`}>{n.v}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeCard;
