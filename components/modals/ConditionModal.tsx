
import React, { useState, useEffect } from 'react';
import { ActionType, ConditionAction, Condition, ConditionProperty, ConditionOperator } from '../../types';
import { BranchIcon } from '../icons/Icons';

interface ConditionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (action: ConditionAction) => void;
  existingAction?: ConditionAction;
}

const ConditionModal: React.FC<ConditionModalProps> = ({ isOpen, onClose, onSave, existingAction }) => {
  const [property, setProperty] = useState<ConditionProperty>(ConditionProperty.WIDTH);
  const [operator, setOperator] = useState<ConditionOperator>(ConditionOperator.GREATER_THAN);
  const [value, setValue] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setError('');
      if (existingAction) {
        const { condition } = existingAction.config;
        setProperty(condition.property || ConditionProperty.WIDTH);
        setOperator(condition.operator || ConditionOperator.GREATER_THAN);
        setValue(condition.value?.toString() || '');
      } else {
        setProperty(ConditionProperty.WIDTH);
        setOperator(ConditionOperator.GREATER_THAN);
        setValue('');
      }
    }
  }, [existingAction, isOpen]);

  const handleSave = () => {
    if (value === null || value === undefined || String(value).trim() === '') {
      setError('Please provide a value for the condition.');
      return;
    }
    
    let parsedValue: string | number = String(value).trim();
    if (property === ConditionProperty.WIDTH || property === ConditionProperty.HEIGHT) {
        const num = parseInt(parsedValue, 10);
        if (isNaN(num) || num <= 0) {
            setError('Please enter a valid positive number for width or height.');
            return;
        }
        parsedValue = num;
    }

    const condition: Condition = { property, operator, value: parsedValue };
    const action: ConditionAction = {
      id: existingAction?.id || '',
      type: ActionType.CONDITION,
      config: { condition },
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
  
  const getOperatorOptions = () => {
    switch (property) {
      case ConditionProperty.WIDTH:
      case ConditionProperty.HEIGHT:
        return [
          { value: ConditionOperator.GREATER_THAN, label: 'Greater than (>)' },
          { value: ConditionOperator.LESS_THAN, label: 'Less than (<)' },
        ];
      case ConditionProperty.FILENAME:
        return [
          { value: ConditionOperator.CONTAINS, label: 'Contains' },
          { value: ConditionOperator.DOES_NOT_CONTAIN, label: 'Does not contain' },
        ];
      case ConditionProperty.FILETYPE:
      case ConditionProperty.COLOR_MODE:
        return [
          { value: ConditionOperator.IS, label: 'Is' },
          { value: ConditionOperator.IS_NOT, label: 'Is not' },
        ];
      default:
        return [];
    }
  };

  const getInputType = () => {
    switch (property) {
        case ConditionProperty.WIDTH:
        case ConditionProperty.HEIGHT:
            return 'number';
        default:
            return 'text';
    }
  };
   const getInputPlaceholder = () => {
    switch (property) {
        case ConditionProperty.WIDTH:
        case ConditionProperty.HEIGHT:
            return 'e.g., 2000';
        case ConditionProperty.FILENAME:
            return 'e.g., _portrait';
        case ConditionProperty.FILETYPE:
            return 'e.g., png';
        case ConditionProperty.COLOR_MODE:
            return 'Select a color mode';
    }
  };

  const handlePropertyChange = (newProperty: ConditionProperty) => {
    setProperty(newProperty);

    // Reset operator and value to sensible defaults for the new property
    switch (newProperty) {
      case ConditionProperty.WIDTH:
      case ConditionProperty.HEIGHT:
        setOperator(ConditionOperator.GREATER_THAN);
        setValue('');
        break;
      case ConditionProperty.FILENAME:
        setOperator(ConditionOperator.CONTAINS);
        setValue('');
        break;
      case ConditionProperty.FILETYPE:
        setOperator(ConditionOperator.IS);
        setValue('');
        break;
      case ConditionProperty.COLOR_MODE:
        setOperator(ConditionOperator.IS);
        setValue('RGB'); // Default value
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className="bg-brand-gray-800 rounded-xl shadow-2xl w-full max-w-xl border border-brand-gray-700 flex flex-col"
        onKeyDown={handleKeyDown}
      >
        
        {/* Header */}
        <div className="flex items-center gap-5 p-6 border-b border-brand-gray-700 shrink-0">
            <div className="flex-shrink-0 w-14 h-14 bg-teal-500/10 rounded-2xl flex items-center justify-center border border-teal-500/20 shadow-sm">
                <BranchIcon className="w-7 h-7 text-teal-400" />
            </div>
            <div>
                <h2 className="text-xl font-bold text-white tracking-tight">{existingAction ? 'Edit' : 'Add'} Condition Step</h2>
                <p className="text-sm text-brand-gray-400 mt-1">Create logic branches based on image properties.</p>
            </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-200 text-sm rounded-lg p-4 mb-6 flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-red-500 mt-0.5 shrink-0">
                         <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div className="font-medium">{error}</div>
                </div>
            )}
            
            <div className="space-y-6">
                <div className="bg-brand-gray-900/50 p-6 rounded-xl border border-brand-gray-700/50">
                    <div className="flex items-center gap-2 mb-5">
                        <span className="bg-brand-gray-700 text-brand-gray-200 text-xs font-bold px-2 py-1 rounded">IF</span>
                        <span className="text-sm font-medium text-brand-gray-300 uppercase tracking-wide">Condition is met</span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                        <div className="sm:col-span-4">
                            <label className="block text-xs font-bold text-brand-gray-400 uppercase mb-1.5 tracking-wide">Property</label>
                            <select value={property} onChange={e => handlePropertyChange(e.target.value as ConditionProperty)} className="w-full bg-brand-gray-800 border border-brand-gray-600 rounded-lg px-3 py-2.5 text-white focus:ring-teal-500 focus:border-teal-500 transition-colors">
                                <option value={ConditionProperty.WIDTH}>Width (px)</option>
                                <option value={ConditionProperty.HEIGHT}>Height (px)</option>
                                <option value={ConditionProperty.FILENAME}>Filename</option>
                                <option value={ConditionProperty.FILETYPE}>File Type</option>
                                <option value={ConditionProperty.COLOR_MODE}>Color Mode</option>
                            </select>
                        </div>
                        <div className="sm:col-span-3">
                            <label className="block text-xs font-bold text-brand-gray-400 uppercase mb-1.5 tracking-wide">Operator</label>
                            <select value={operator} onChange={e => setOperator(e.target.value as ConditionOperator)} className="w-full bg-brand-gray-800 border border-brand-gray-600 rounded-lg px-3 py-2.5 text-white focus:ring-teal-500 focus:border-teal-500 transition-colors">
                                {getOperatorOptions().map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                        </div>
                        <div className="sm:col-span-5">
                             <label className="block text-xs font-bold text-brand-gray-400 uppercase mb-1.5 tracking-wide">Value</label>
                            {property === ConditionProperty.COLOR_MODE ? (
                                <select
                                    value={value}
                                    onChange={e => { setValue(e.target.value); setError(''); }}
                                    className="w-full bg-brand-gray-800 border border-brand-gray-600 rounded-lg px-3 py-2.5 text-white focus:ring-teal-500 focus:border-teal-500 transition-colors"
                                >
                                    <option value="RGB">RGB</option>
                                    <option value="CMYK">CMYK</option>
                                </select>
                            ) : (
                                <input
                                    type={getInputType()}
                                    placeholder={getInputPlaceholder()}
                                    value={value}
                                    onChange={e => { setValue(e.target.value); setError(''); }}
                                    className="w-full bg-brand-gray-800 border border-brand-gray-600 rounded-lg px-3 py-2.5 text-white focus:ring-teal-500 focus:border-teal-500 transition-colors"
                                />
                            )}
                        </div>
                    </div>
                </div>
                <p className="text-center text-brand-gray-400 text-sm">
                    If true, nested actions will run. Otherwise, they are skipped.
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
            className="px-6 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-lg shadow-teal-600/20 transition-all transform active:scale-95 text-sm"
          >
            {existingAction ? 'Save Changes' : 'Add Condition'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConditionModal;
