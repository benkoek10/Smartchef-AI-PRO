
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import IngredientInput from './components/IngredientInput';
import RecipeCard from './components/RecipeCard';
import DietaryFilters from './components/DietaryFilters';
import VoiceChat from './components/VoiceChat';
import ShoppingList from './components/ShoppingList';
import { generateRecipes, generateRecipeImage } from './services/gemini';
import { GenerationState, Recipe, DietaryPreference, ShoppingItem } from './types';

const LOADING_MESSAGES = [
  "Chef stelt smaken samen...",
  "Ingrediënten aan het analyseren...",
  "Gerechten worden gefotografeerd...",
  "Perfecte balans aan het zoeken...",
  "Bijna klaar voor serveren..."
];

const App: React.FC = () => {
  const [state, setState] = useState<GenerationState>({
    loading: false,
    status: '',
    error: null,
    recipes: [],
  });
  const [dietary, setDietary] = useState<DietaryPreference[]>([]);
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [view, setView] = useState<'generate' | 'favorites' | 'shopping'>('generate');

  useEffect(() => {
    const savedFavs = localStorage.getItem('smartchef_favorites');
    const savedShop = localStorage.getItem('smartchef_shopping');
    if (savedFavs) setFavorites(JSON.parse(savedFavs));
    if (savedShop) setShoppingList(JSON.parse(savedShop));
  }, []);

  useEffect(() => {
    localStorage.setItem('smartchef_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('smartchef_shopping', JSON.stringify(shoppingList));
  }, [shoppingList]);

  // Loading status rotator
  useEffect(() => {
    if (state.loading) {
      const interval = setInterval(() => {
        setState(prev => ({
          ...prev,
          status: LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]
        }));
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [state.loading]);

  const toggleDietary = (pref: DietaryPreference) => {
    setDietary(prev => prev.includes(pref) ? prev.filter(p => p !== pref) : [...prev, pref]);
  };

  const toggleFavorite = (id: string) => {
    const isFav = favorites.some(f => f.id === id);
    if (isFav) {
      setFavorites(prev => prev.filter(f => f.id !== id));
    } else {
      const recipeToAdd = state.recipes.find(r => r.id === id);
      if (recipeToAdd) setFavorites(prev => [...prev, recipeToAdd]);
    }
  };

  const addToShoppingList = (recipe: Recipe) => {
    const newItems: ShoppingItem[] = recipe.ingredients.map(ing => ({
      id: Math.random().toString(36).substr(2, 9),
      name: ing,
      checked: false,
      recipeTitle: recipe.title
    }));
    setShoppingList(prev => [...prev, ...newItems]);
  };

  const toggleShoppingItem = (id: string) => {
    setShoppingList(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const handleGenerate = async (ingredients: string) => {
    setView('generate');
    setState({ loading: true, status: LOADING_MESSAGES[0], error: null, recipes: [] });

    try {
      const fetchedRecipes = await generateRecipes(ingredients, dietary);
      setState(prev => ({ ...prev, recipes: fetchedRecipes }));

      const recipesWithImages = [...fetchedRecipes];
      for (let i = 0; i < recipesWithImages.length; i++) {
        const imageUrl = await generateRecipeImage(recipesWithImages[i]);
        if (imageUrl) {
          recipesWithImages[i] = { ...recipesWithImages[i], imageUrl };
          setState(prev => {
             const newRecipes = [...prev.recipes];
             newRecipes[i] = recipesWithImages[i];
             return { ...prev, recipes: newRecipes };
          });
        }
      }

      setState(prev => ({ ...prev, loading: false, status: '' }));
    } catch (err: any) {
      console.error(err);
      setState({ 
        loading: false, 
        status: '',
        error: "Oeps! De chef had een probleempje in de keuken. Probeer het opnieuw.", 
        recipes: [] 
      });
    }
  };

  return (
    <div className="min-h-screen text-slate-200 selection:bg-emerald-500/30 selection:text-emerald-200 bg-[#0b1220] overflow-x-hidden pb-20">
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <Header />
        
        <main className="flex flex-col gap-12">
          <aside className="w-full space-y-6">
            <div className="glass-card p-6 rounded-[2.5rem] border border-white/5 shadow-2xl">
              <nav className="flex bg-slate-900/60 p-1.5 rounded-2xl mb-8">
                {[
                  { id: 'generate', label: 'Chef', icon: '🍳' },
                  { id: 'favorites', label: 'Favoriet', icon: '💖' },
                  { id: 'shopping', label: 'Lijstje', icon: '🛒' }
                ].map((tab) => (
                  <button 
                    key={tab.id}
                    onClick={() => setView(tab.id as any)}
                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex flex-col items-center gap-1 ${
                      view === tab.id 
                      ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg' 
                      : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <span className="text-base">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>

              <div className="min-h-[200px] animate-in fade-in duration-500">
                {view === 'generate' && (
                  <div className="space-y-6">
                    <IngredientInput onGenerate={handleGenerate} isLoading={state.loading} />
                    <DietaryFilters selected={dietary} onChange={toggleDietary} />
                  </div>
                )}
                
                {view === 'favorites' && (
                  <div className="text-center py-10 opacity-60">
                    <div className="text-4xl mb-4">📖</div>
                    <p className="text-xs font-black uppercase tracking-widest text-emerald-400">Jouw Kookboek</p>
                    <p className="text-sm mt-2 text-slate-400">Klik op het hartje bij een recept om het hier op te slaan.</p>
                  </div>
                )}

                {view === 'shopping' && (
                  <ShoppingList 
                    items={shoppingList} 
                    onToggle={toggleShoppingItem}
                    onRemove={(id) => setShoppingList(prev => prev.filter(i => i.id !== id))}
                    onClear={() => setShoppingList([])}
                  />
                )}
              </div>
              
              {state.error && (
                <div className="mt-6 bg-red-500/10 border border-red-500/30 text-red-400 p-5 rounded-2xl text-xs font-bold animate-in slide-in-from-top-2 flex items-center gap-4">
                  <span className="text-2xl">👨‍🍳💨</span>
                  {state.error}
                </div>
              )}
            </div>

            <div className="p-8 rounded-[2rem] border border-slate-800/40 bg-slate-900/10 backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">🥗</div>
              <h4 className="text-emerald-400 font-black text-[10px] uppercase tracking-[0.2em] mb-4">Status Update</h4>
              <p className="text-slate-400 text-xs leading-relaxed font-bold">
                {state.loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                    {state.status}
                  </span>
                ) : (
                  "Klaar voor actie! Vraag de AI Assistent om hulp als je tijdens het koken vastloopt."
                )}
              </p>
            </div>
          </aside>

          <section className="w-full">
            {(view === 'generate' ? state.recipes : favorites).length > 0 ? (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800/50 pb-10">
                  <div>
                    <h2 className="text-4xl font-black text-white tracking-tighter mb-2">
                      {view === 'generate' ? 'Nieuwe Ontdekkingen' : 'Opgeslagen Recepten'}
                    </h2>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                      {view === 'generate' ? 'AI-gegenereerd op basis van jouw ingrediënten' : `Je hebt ${favorites.length} gerechten bewaard`}
                    </p>
                  </div>
                </header>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {(view === 'generate' ? state.recipes : favorites).map((recipe) => (
                    <RecipeCard 
                      key={recipe.id} 
                      recipe={recipe} 
                      onToggleFavorite={toggleFavorite}
                      isFavorite={favorites.some(f => f.id === recipe.id)}
                      onAddAllToShoppingList={addToShoppingList}
                    />
                  ))}
                </div>
              </div>
            ) : !state.loading ? (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-slate-800/40 rounded-[3rem] text-slate-700 p-10 text-center group hover:border-emerald-500/20 transition-all">
                <div className="text-7xl mb-6 group-hover:scale-110 transition-transform duration-700 opacity-10">🍱</div>
                <h3 className="text-2xl font-black text-slate-400 mb-4 tracking-tight italic">
                  {view === 'generate' ? 'Jouw keuken, onze AI' : 'Nog geen favorieten'}
                </h3>
                <p className="max-w-md mx-auto text-xs font-semibold text-slate-500 leading-relaxed uppercase tracking-widest opacity-60">
                  {view === 'generate' 
                    ? "Voer je ingrediënten in en laat de magie beginnen." 
                    : "Zodra je een recept bewaart, verschijnt het hier in je eigen digitale kookboek."}
                </p>
              </div>
            ) : (
              <div className="space-y-16">
                <div className="h-10 bg-slate-800/30 rounded-2xl w-1/3 animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {[1, 2].map(i => (
                    <div key={i} className="glass-card rounded-[2.5rem] h-[600px] animate-pulse overflow-hidden">
                      <div className="h-64 bg-slate-800/40" />
                      <div className="p-8 space-y-6">
                        <div className="h-8 bg-slate-800/40 rounded-xl w-3/4" />
                        <div className="h-3 bg-slate-800/30 rounded-lg w-full" />
                        <div className="h-32 bg-slate-800/20 rounded-2xl" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </main>

        <footer className="mt-40 pt-16 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-10 text-slate-600 text-[9px] font-black uppercase tracking-[0.3em]">
          <p>© {new Date().getFullYear()} SmartChef AI Pro · Alle rechten voorbehouden</p>
          <div className="flex gap-12">
            <span className="hover:text-emerald-500 transition-colors cursor-pointer">Recepten</span>
            <span className="hover:text-emerald-500 transition-colors cursor-pointer">AI Chef</span>
            <span className="hover:text-emerald-500 transition-colors cursor-pointer opacity-40">Powered by Google Gemini 3</span>
          </div>
        </footer>
      </div>
      <VoiceChat />
    </div>
  );
};

export default App;
