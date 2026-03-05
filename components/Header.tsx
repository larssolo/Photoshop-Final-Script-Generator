
import React from 'react';
import { CameraIcon, UploadIcon } from './icons/Icons';

interface HeaderProps {
    onImportClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onImportClick }) => {
  return (
    <header className="bg-brand-gray-800 border-b border-brand-gray-700 shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <div className="bg-brand-blue p-2 rounded-lg">
            <CameraIcon className="w-8 h-8 text-white"/>
            </div>
            <div>
            <h1 className="text-2xl font-bold text-white">Photoshop Script Generator</h1>
            <p className="text-sm text-brand-gray-300">Build automated workflows for image processing</p>
            </div>
        </div>
        
        <button 
            onClick={onImportClick}
            className="flex items-center gap-2 bg-brand-gray-700 hover:bg-brand-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
        >
            <UploadIcon className="w-5 h-5" />
            Import Script
        </button>
      </div>
    </header>
  );
};

export default Header;
