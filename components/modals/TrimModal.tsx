
import React, { useState, useEffect } from 'react';
import { ActionType, TrimAction, TrimBasedOn } from '../../types';
import { ScissorsIcon } from '../icons/Icons';

interface TrimModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (action: TrimAction) => void;
  existingAction?: TrimAction;
}

const TrimModal: React.FC<TrimModalProps> = ({ isOpen, onClose, onSave, existingAction }) => {
  const [basedOn, setBasedOn] = useState<TrimBasedOn>(TrimBasedOn.TRANSPARENT_PIXELS);
  const [top, setTop] = useState<boolean>(true);
  const [bottom, setBottom] = useState<boolean>(true);
  const [left, setLeft] = useState<boolean>(true);
  const [right, setRight] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen) {
      if (existingAction) {
        const config = existingAction.config;
        setBasedOn(config.basedOn);
        setTop(config.top);
        setBottom(config.bottom);
        setLeft(config.left);
        setRight(config.right);
      } else {
        setBasedOn(TrimBasedOn.TRANSPARENT_PIXELS);
        setTop(true);
        setBottom(true);
        setLeft(true);
        setRight(true);
      }
    }
  }, [existingAction, isOpen]);

  const handleSave = () => {
    const action: TrimAction = {
      id: existingAction?.id || '',
      type: ActionType.TRIM,
      config: {
        basedOn,
        top,
        bottom,
        left,
        right
      },
      then: existingAction?.then || [],
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

  const checkboxClass = `text-orange-600 focus:ring-orange-500`;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className="bg-brand-gray-800 rounded-xl shadow-2xl w-full max-w-md border border-brand-gray-700 flex flex-col"
        onKeyDown={handleKeyDown}
      >
        
        {/* Header */}
        <div className="flex items-center gap-5 p-6 border-b border-brand-gray-700 shrink-0">
            <div className="flex-shrink-0 w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center border border-orange-500/20 shadow-sm">
                <ScissorsIcon className="w-7 h-7 text-orange-500" />
            </div>
            <div>
                <h2 className="text-xl font-bold text-white tracking-tight">{existingAction ? 'Edit' : 'Add'} Trim Step</h2>
                <p className="text-sm text-brand-gray-400 mt-1">Automatically crop based on content.</p>
            </div>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6">
            
            {/* Based On Section */}
            <div>
                <label className="block text-sm font-medium text-brand-gray-300 mb-3">Based On</label>
                <div className="space-y-3">
                    <div 
                        onClick={() => setBasedOn(TrimBasedOn.TRANSPARENT_PIXELS)}
                        className={`p-3 rounded-lg cursor-pointer border transition-all flex items-center gap-3 ${basedOn === TrimBasedOn.TRANSPARENT_PIXELS ? 'bg-orange-600/20 border-orange-500' : 'bg-brand-gray-900 border-brand-gray-700 hover:bg-brand-gray-800'}`}
                    >
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${basedOn === TrimBasedOn.TRANSPARENT_PIXELS ? 'border-orange-500' : 'border-brand-gray-500'}`}>
                            {basedOn === TrimBasedOn.TRANSPARENT_PIXELS && <div className="w-2 h-2 rounded-full bg-orange-500"></div>}
                        </div>
                        <span className="text-sm text-white">Transparent Pixels</span>
                    </div>
                    <div 
                        onClick={() => setBasedOn(TrimBasedOn.TOP_LEFT_PIXEL_COLOR)}
                        className={`p-3 rounded-lg cursor-pointer border transition-all flex items-center gap-3 ${basedOn === TrimBasedOn.TOP_LEFT_PIXEL_COLOR ? 'bg-orange-600/20 border-orange-500' : 'bg-brand-gray-900 border-brand-gray-700 hover:bg-brand-gray-800'}`}
                    >
                         <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${basedOn === TrimBasedOn.TOP_LEFT_PIXEL_COLOR ? 'border-orange-500' : 'border-brand-gray-500'}`}>
                            {basedOn === TrimBasedOn.TOP_LEFT_PIXEL_COLOR && <div className="w-2 h-2 rounded-full bg-orange-500"></div>}
                        </div>
                        <span className="text-sm text-white">Top Left Pixel Color</span>
                    </div>
                    <div 
                        onClick={() => setBasedOn(TrimBasedOn.BOTTOM_RIGHT_PIXEL_COLOR)}
                        className={`p-3 rounded-lg cursor-pointer border transition-all flex items-center gap-3 ${basedOn === TrimBasedOn.BOTTOM_RIGHT_PIXEL_COLOR ? 'bg-orange-600/20 border-orange-500' : 'bg-brand-gray-900 border-brand-gray-700 hover:bg-brand-gray-800'}`}
                    >
                         <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${basedOn === TrimBasedOn.BOTTOM_RIGHT_PIXEL_COLOR ? 'border-orange-500' : 'border-brand-gray-500'}`}>
                            {basedOn === TrimBasedOn.BOTTOM_RIGHT_PIXEL_COLOR && <div className="w-2 h-2 rounded-full bg-orange-500"></div>}
                        </div>
                        <span className="text-sm text-white">Bottom Right Pixel Color</span>
                    </div>
                </div>
            </div>

            {/* Trim Away Section */}
            <div className="bg-brand-gray-900/50 p-4 rounded-xl border border-brand-gray-700/50">
                <label className="block text-sm font-medium text-brand-gray-300 mb-3">Trim Away</label>
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                         <input 
                            id="trimTop" 
                            type="checkbox" 
                            checked={top} 
                            onChange={e => setTop(e.target.checked)} 
                            className={`h-5 w-5 bg-brand-gray-700 border-brand-gray-600 rounded ${checkboxClass} ring-offset-brand-gray-900`} 
                        />
                        <label htmlFor="trimTop" className="ml-2.5 text-sm text-brand-gray-300">Top</label>
                    </div>
                    <div className="flex items-center">
                         <input 
                            id="trimLeft" 
                            type="checkbox" 
                            checked={left} 
                            onChange={e => setLeft(e.target.checked)} 
                            className={`h-5 w-5 bg-brand-gray-700 border-brand-gray-600 rounded ${checkboxClass} ring-offset-brand-gray-900`} 
                        />
                        <label htmlFor="trimLeft" className="ml-2.5 text-sm text-brand-gray-300">Left</label>
                    </div>
                    <div className="flex items-center">
                         <input 
                            id="trimBottom" 
                            type="checkbox" 
                            checked={bottom} 
                            onChange={e => setBottom(e.target.checked)} 
                            className={`h-5 w-5 bg-brand-gray-700 border-brand-gray-600 rounded ${checkboxClass} ring-offset-brand-gray-900`} 
                        />
                        <label htmlFor="trimBottom" className="ml-2.5 text-sm text-brand-gray-300">Bottom</label>
                    </div>
                    <div className="flex items-center">
                         <input 
                            id="trimRight" 
                            type="checkbox" 
                            checked={right} 
                            onChange={e => setRight(e.target.checked)} 
                            className={`h-5 w-5 bg-brand-gray-700 border-brand-gray-600 rounded ${checkboxClass} ring-offset-brand-gray-900`} 
                        />
                        <label htmlFor="trimRight" className="ml-2.5 text-sm text-brand-gray-300">Right</label>
                    </div>
                </div>
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
            className="px-6 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-lg shadow-orange-600/20 transition-all transform active:scale-95 text-sm"
          >
            {existingAction ? 'Save Changes' : 'Add Trim Step'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrimModal;
