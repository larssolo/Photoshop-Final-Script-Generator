
import React from 'react';
import { CameraIcon, UploadIcon } from './icons/Icons';

interface HeaderProps {
    onImportClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onImportClick }) => {
  return (
    <header className="border-b border-brand-gray-700/60 bg-brand-gray-900/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="bg-gradient-to-br from-brand-blue to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-brand-blue/20 flex-shrink-0">
            <CameraIcon className="w-6 h-6 text-white"/>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Photoshop Script Generator</h1>
            <p className="text-xs text-brand-gray-400 mt-0.5 hidden sm:block">Automate complex image workflows with AI-generated ExtendScript</p>
          </div>
        </div>

        <button
          onClick={onImportClick}
          className="flex items-center gap-2 bg-brand-gray-700/80 hover:bg-brand-gray-700 text-brand-gray-200 hover:text-white font-medium py-2 px-4 rounded-xl border border-brand-gray-600/50 hover:border-brand-gray-500/80 transition-all duration-150 active:scale-95 text-sm"
        >
          <UploadIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Import Script</span>
          <span className="sm:hidden">Import</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
