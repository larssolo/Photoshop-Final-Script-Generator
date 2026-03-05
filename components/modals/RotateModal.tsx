
import React, { useState, useEffect } from 'react';
import { ActionType, RotateAction, RotationType } from '../../types';
import { RotateIcon } from '../icons/Icons';

interface RotateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (action: RotateAction) => void;
  existingAction?: RotateAction;
}

const RotateModal: React.FC<RotateModalProps> = ({ isOpen, onClose, onSave, existingAction }) => {
  const [rotation, setRotation] = useState<RotationType>(existingAction?.config.rotation || RotationType.CW_90);

  useEffect(() => {
    if (isOpen) {
      setRotation(existingAction?.config.rotation || RotationType.CW_90);
    }
  }, [existingAction, isOpen]);

  const handleSave = () => {
    const action: RotateAction = {
      id: existingAction?.id || '',
      type: ActionType.ROTATE,
      config: { rotation },
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

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className="bg-brand-gray-800 rounded-xl shadow-2xl w-full max-w-md border border-brand-gray-700 flex flex-col"
        onKeyDown={handleKeyDown}
      >
        
        {/* Header */}
        <div className="flex items-center gap-5 p-6 border-b border-brand-gray-700 shrink-0">
            <div className="flex-shrink-0 w-14 h-14 bg-yellow-500/10 rounded-2xl flex items-center justify-center border border-yellow-500/20 shadow-sm">
                <RotateIcon className="w-7 h-7 text-yellow-500" />
            </div>
            <div>
                <h2 className="text-xl font-bold text-white tracking-tight">{existingAction ? 'Edit' : 'Add'} Rotate Step</h2>
                <p className="text-sm text-brand-gray-400 mt-1">Rotate the image canvas.</p>
            </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
            <label className="block text-sm font-medium text-brand-gray-300 mb-4">Rotation Angle</label>
            <div className="space-y-3">
                {[
                    { type: RotationType.CW_90, label: '90° Clockwise', desc: 'Rotate right' },
                    { type: RotationType.CCW_90, label: '90° Counter-Clockwise', desc: 'Rotate left' },
                    { type: RotationType.DEG_180, label: '180°', desc: 'Upside down' }
                ].map(opt => (
                     <button 
                        key={opt.type}
                        onClick={() => setRotation(opt.type)} 
                        className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between group ${rotation === opt.type ? 'bg-yellow-600/20 border-yellow-500 ring-1 ring-yellow-500' : 'bg-brand-gray-900 border-brand-gray-700 hover:bg-brand-gray-800 hover:border-brand-gray-600'}`}
                    >
                        <div>
                            <span className={`font-semibold block ${rotation === opt.type ? 'text-white' : 'text-brand-gray-200'}`}>{opt.label}</span>
                            <span className="text-xs text-brand-gray-400 mt-1">{opt.desc}</span>
                        </div>
                        {rotation === opt.type && (
                            <div className="w-5 h-5 rounded-full bg-yellow-500 shadow-sm shadow-yellow-500/50 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-black font-bold">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                        )}
                    </button>
                ))}
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
            className="px-6 py-2.5 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white font-bold shadow-lg shadow-yellow-600/20 transition-all transform active:scale-95 text-sm"
          >
            {existingAction ? 'Save Changes' : 'Add Rotate Step'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RotateModal;
