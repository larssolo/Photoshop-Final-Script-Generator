
import React, { useState, useEffect } from 'react';
import { Preset } from '../types';
import { TrashIcon, UploadIcon, DownloadIcon } from './icons/Icons';

interface PresetManagerProps {
  presets: Preset[];
  onLoad: (presetName: string) => void;
  onDelete: (presetName: string) => void;
  onImport: () => void;
  onExport: () => void;
}

const PresetManager: React.FC<PresetManagerProps> = ({ presets, onLoad, onDelete, onImport, onExport }) => {
  const [selectedPreset, setSelectedPreset] = useState<string>('');

  // Effect to reset selection if the selected preset is deleted from the list
  useEffect(() => {
    if (selectedPreset && !presets.some(p => p.name === selectedPreset)) {
      setSelectedPreset('');
    }
  }, [presets, selectedPreset]);


  const handleLoad = () => {
    if (selectedPreset) {
      onLoad(selectedPreset);
    }
  };

  const handleDelete = () => {
    if (selectedPreset) {
      onDelete(selectedPreset);
    }
  };

  return (
    <div className="mb-6 p-4 bg-brand-gray-900 rounded-lg border border-brand-gray-700">
        <div className="flex justify-between items-start">
            <div>
                <h3 className="text-lg font-bold text-white mb-2">Presets</h3>
                <p className="text-xs text-brand-gray-400 mb-4">Load your favorite action sequences. Presets are saved in your browser, but you can export them to a JSON file for backup or sharing on services like Google Drive.</p>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
                 <label htmlFor="preset-select" className="text-sm font-medium text-brand-gray-300">Load Preset</label>
                <select 
                    id="preset-select"
                    value={selectedPreset} 
                    onChange={(e) => setSelectedPreset(e.target.value)}
                    className="w-full bg-brand-gray-800 border border-brand-gray-600 rounded-md p-2 text-white focus:ring-brand-blue focus:border-brand-blue"
                    aria-label="Select a preset to load"
                >
                    <option value="">-- Select a preset --</option>
                    {presets.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                </select>
                <div className="flex gap-2">
                    <button 
                        onClick={handleLoad} 
                        disabled={!selectedPreset}
                        className="flex-1 flex items-center justify-center gap-2 bg-brand-blue hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 disabled:bg-brand-gray-600 disabled:cursor-not-allowed"
                    >
                        Load
                    </button>
                    <button 
                        onClick={handleDelete} 
                        disabled={!selectedPreset}
                        className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 disabled:bg-brand-gray-600 disabled:cursor-not-allowed"
                        aria-label="Delete selected preset"
                    >
                        <TrashIcon className="w-5 h-5"/>
                    </button>
                </div>
            </div>
            <div className="flex flex-col gap-2 justify-end">
                <label className="text-sm font-medium text-brand-gray-300">Manage All Presets</label>
                <div className="flex gap-2">
                     <button 
                        onClick={onImport}
                        className="flex-1 flex items-center justify-center gap-2 bg-brand-gray-600 hover:bg-brand-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                        <UploadIcon className="w-5 h-5" />
                        Import
                    </button>
                    <button 
                        onClick={onExport}
                        disabled={presets.length === 0}
                        className="flex-1 flex items-center justify-center gap-2 bg-brand-gray-600 hover:bg-brand-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 disabled:bg-brand-gray-700 disabled:text-brand-gray-500 disabled:cursor-not-allowed"
                    >
                        <DownloadIcon className="w-5 h-5" />
                        Export
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default PresetManager;
