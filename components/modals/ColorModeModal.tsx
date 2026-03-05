
import React, { useState, useEffect } from 'react';
import { ActionType, ColorModeAction, ColorProfile } from '../../types';
import { ColorSwatchIcon } from '../icons/Icons';

interface ColorModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (action: ColorModeAction) => void;
  existingAction?: ColorModeAction;
}

const ColorModeModal: React.FC<ColorModeModalProps> = ({ isOpen, onClose, onSave, existingAction }) => {
  const [profile, setProfile] = useState<ColorProfile>(existingAction?.config.profile || ColorProfile.RGB);

  useEffect(() => {
    if (isOpen) {
      setProfile(existingAction?.config.profile || ColorProfile.RGB);
    }
  }, [existingAction, isOpen]);

  const handleSave = () => {
    const action: ColorModeAction = {
      id: existingAction?.id || '',
      type: ActionType.COLOR_MODE,
      config: { profile },
    };
    onSave(action);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        const target = e.target as HTMLElement;
        if (target.tagName === 'BUTTON') return;
        
        e.preventDefault();
        handleSave();
    }
  };

  if (!isOpen) return null;
  
  const options = [
    { value: ColorProfile.RGB, label: 'RGB', description: 'Best for web and digital screens.' },
    { value: ColorProfile.CMYK, label: 'CMYK', description: 'Standard for professional printing.' },
    { value: ColorProfile.GRAYSCALE, label: 'Grayscale', description: 'For black and white images.' },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className="bg-brand-gray-800 rounded-xl shadow-2xl w-full max-w-md border border-brand-gray-700 flex flex-col"
        onKeyDown={handleKeyDown}
      >
        
        {/* Header */}
        <div className="flex items-center gap-5 p-6 border-b border-brand-gray-700 shrink-0">
            <div className="flex-shrink-0 w-14 h-14 bg-pink-500/10 rounded-2xl flex items-center justify-center border border-pink-500/20 shadow-sm">
                <ColorSwatchIcon className="w-7 h-7 text-pink-500" />
            </div>
            <div>
                <h2 className="text-xl font-bold text-white tracking-tight">{existingAction ? 'Edit' : 'Add'} Color Mode</h2>
                <p className="text-sm text-brand-gray-400 mt-1">Convert document color profile.</p>
            </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
            <label className="block text-sm font-medium text-brand-gray-300 mb-4">Target Color Profile</label>
            <div className="space-y-3">
                {options.map(option => (
                     <div 
                        key={option.value}
                        onClick={() => setProfile(option.value)}
                        className={`p-4 rounded-xl cursor-pointer border transition-all flex items-center justify-between group ${profile === option.value ? 'bg-pink-600/20 border-pink-500 ring-1 ring-pink-500' : 'bg-brand-gray-900 border-brand-gray-700 hover:bg-brand-gray-800 hover:border-brand-gray-600'}`}
                    >
                        <div>
                            <p className={`font-semibold ${profile === option.value ? 'text-white' : 'text-brand-gray-200'}`}>{option.label}</p>
                            <p className="text-xs text-brand-gray-400 mt-1">{option.description}</p>
                        </div>
                        {profile === option.value && (
                            <div className="w-5 h-5 rounded-full bg-pink-500 shadow-sm shadow-pink-500/50 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-white font-bold">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <div className="mt-4 p-3 bg-brand-gray-900/50 rounded-lg border border-brand-gray-700/30">
                <p className="text-xs text-brand-gray-400 text-center">
                    Note: Converting color modes may require flattening the image.
                </p>
            </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-brand-gray-700 flex justify-end gap-3 shrink-0 bg-brand-gray-800 rounded-b-xl">
          <button 
            onClick={onClose} 
            className="px-5 py-2.5 rounded-lg font-medium text-brand-gray-400 hover:text-white hover:bg-brand-gray-700 transition-colors text-sm"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            className="px-6 py-2.5 rounded-lg bg-pink-600 hover:bg-pink-700 text-white font-bold shadow-lg shadow-pink-600/20 transition-all transform active:scale-95 text-sm"
          >
            {existingAction ? 'Save Changes' : 'Add Color Step'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ColorModeModal;
