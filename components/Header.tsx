
import React from 'react';
import { User } from '@supabase/supabase-js';
import { CameraIcon, UploadIcon } from './icons/Icons';

interface HeaderProps {
  onImportClick: () => void;
  credits: number | null;
  onBuyCredits: () => void;
  user: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
}

const Header: React.FC<HeaderProps> = ({ onImportClick, credits, onBuyCredits, user, onSignIn, onSignOut }) => {
  const outOfCredits = credits === 0;
  return (
    <header className="border-b border-brand-gray-700/60 bg-brand-gray-900/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="bg-gradient-to-br from-brand-blue to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-brand-blue/20 flex-shrink-0">
            <CameraIcon className="w-6 h-6 text-white"/>
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-white tracking-tight">Photoshop Script Generator</h1>
            <p className="text-xs text-brand-gray-400 mt-0.5 hidden sm:block">Automate complex image workflows with AI-generated ExtendScript</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {user ? (
            <>
              {/* Credit badge */}
              {credits !== null && (
                <span className={`hidden sm:inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                  outOfCredits
                    ? 'bg-red-500/10 border-red-500/30 text-red-300'
                    : 'bg-brand-gray-800 border-brand-gray-700 text-brand-gray-400'
                }`}>
                  ⚡ {credits} credit{credits !== 1 ? 's' : ''}
                </span>
              )}

              {/* Buy button */}
              {credits !== null && (
                <button
                  onClick={onBuyCredits}
                  className={`hidden sm:flex items-center gap-1.5 font-medium py-2 px-3 rounded-xl border text-sm transition-all duration-150 active:scale-95 ${
                    outOfCredits
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500/60 shadow-lg shadow-indigo-900/40'
                      : 'bg-brand-gray-800/60 hover:bg-brand-gray-700 text-brand-gray-300 hover:text-white border-brand-gray-700/50 hover:border-brand-gray-600'
                  }`}
                >
                  {outOfCredits ? 'Buy credits' : 'Buy 4 scripts – $2'}
                </button>
              )}

              {/* User email + logout */}
              <span className="hidden md:block text-xs text-brand-gray-500 max-w-[120px] truncate">
                {user.email}
              </span>
              <button
                onClick={onSignOut}
                className="flex items-center gap-1.5 bg-brand-gray-800/60 hover:bg-brand-gray-700 text-brand-gray-400 hover:text-white font-medium py-2 px-3 rounded-xl border border-brand-gray-700/50 transition-all duration-150 active:scale-95 text-xs"
              >
                Sign out
              </button>

              {/* Import */}
              <button
                onClick={onImportClick}
                className="flex items-center gap-2 bg-brand-gray-700/80 hover:bg-brand-gray-700 text-brand-gray-200 hover:text-white font-medium py-2 px-4 rounded-xl border border-brand-gray-600/50 hover:border-brand-gray-500/80 transition-all duration-150 active:scale-95 text-sm"
              >
                <UploadIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Import Script</span>
                <span className="sm:hidden">Import</span>
              </button>
            </>
          ) : (
            <button
              onClick={onSignIn}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold py-2 px-4 rounded-xl shadow-lg shadow-indigo-900/40 transition-all duration-150 active:scale-95 text-sm"
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
