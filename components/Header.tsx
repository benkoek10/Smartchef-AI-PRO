
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between mb-8 group">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-600 rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/20">
          🍳
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            SmartChef AI <span className="text-emerald-400">Pro</span>
          </h1>
          <p className="text-slate-400 font-medium text-sm">Culinair meesterschap binnen handbereik.</p>
        </div>
      </div>
    </header>
  );
};

export default Header;
