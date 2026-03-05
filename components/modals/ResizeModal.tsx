
import React, { useState, useEffect, FC } from 'react';
import { ActionType, ResizeAction, ResizeUnit, ResizeMode, SaveFormat, SaveConfig, SaveLogic, FileNameConflictResolution } from '../../types';
import { RESIZE_UNIT_OPTIONS, SAVE_FORMAT_OPTIONS, TIFF_COMPRESSION_OPTIONS } from '../../constants';
import { ResizeIcon } from '../icons/Icons';

interface ResizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (action: ResizeAction) => void;
  existingAction?: ResizeAction;
}

export interface SaveFormProps {
    config: SaveConfig;
    onUpdate: (newConfig: SaveConfig) => void;
    idPrefix: string;
    accentColor?: string;
}

export const SaveForm: FC<SaveFormProps> = ({ config, onUpdate, idPrefix, accentColor = 'green' }) => {
    const { 
        format, 
        jpegQuality = 8, 
        pngTransparency = true, 
        tiffCompression = 'LZW', 
        tiffTransparency = false, 
        psdTiffLayers = false, 
        appendSuffix = '', 
        subfolder = '',
        conflictResolution = FileNameConflictResolution.OVERWRITE
    } = config;

    const focusRingClass = `focus:ring-${accentColor}-500 focus:border-${accentColor}-500`;
    const checkboxClass = `text-${accentColor}-600 focus:ring-${accentColor}-500`;
    const activeBtnClass = `bg-${accentColor}-600 text-white shadow-md`;

    const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newFormat = e.target.value as SaveFormat;
        const updates: Partial<SaveConfig> = { format: newFormat };
        
        // Set smart defaults when switching formats
        if (newFormat === SaveFormat.PNG) {
            updates.pngTransparency = true;
        } else if (newFormat === SaveFormat.JPEG) {
            updates.jpegQuality = 8;
        } else if (newFormat === SaveFormat.TIFF) {
            updates.tiffCompression = 'LZW';
            updates.psdTiffLayers = false; // Default to flattened for compatibility
        }
        
        onUpdate({ ...config, ...updates });
    };

    return (
         <div className="space-y-5">
            <div>
                <label className="block text-sm font-medium text-brand-gray-300 mb-1.5">File Format</label>
                <select value={format} onChange={handleFormatChange} className={`w-full bg-brand-gray-900 border border-brand-gray-600 rounded-lg px-4 py-2.5 text-white transition-colors ${focusRingClass}`}>
                {SAVE_FORMAT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
            </div>
            
            {format === SaveFormat.TIFF && (
                <div className="p-3 bg-yellow-900/20 border border-yellow-700/30 rounded-lg flex gap-3">
                    <div className="shrink-0 mt-0.5 text-yellow-500">
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                    </div>
                    <p className="text-xs text-yellow-200/80 leading-relaxed">
                        For CMYK source images, TIFFs will always be saved as flattened (no layers or transparency) to prevent errors in Photoshop.
                    </p>
                </div>
            )}

            {format === SaveFormat.JPEG && (
                <div className="bg-brand-gray-900/50 p-4 rounded-xl border border-brand-gray-700/50">
                    <div className="flex justify-between mb-2">
                        <label className="block text-sm font-medium text-brand-gray-300">JPEG Quality</label>
                        <span className={`text-sm font-bold text-${accentColor}-500`}>{jpegQuality}</span>
                    </div>
                    <input type="range" min="0" max="12" value={jpegQuality} onChange={e => onUpdate({ ...config, jpegQuality: parseInt(e.target.value) })} className={`w-full h-2 bg-brand-gray-600 rounded-lg appearance-none cursor-pointer accent-${accentColor}-500`} />
                    <div className="flex justify-between mt-1 text-xs text-brand-gray-500">
                        <span>Low (0)</span>
                        <span>High (8)</span>
                        <span>Max (12)</span>
                    </div>
                </div>
            )}

            {format === SaveFormat.PNG && (
                <div className="flex items-start p-4 bg-brand-gray-900/50 rounded-xl border border-brand-gray-700/50">
                    <div className="flex h-5 items-center">
                        <input 
                            id={`${idPrefix}_pngTransparency`} 
                            type="checkbox" 
                            checked={pngTransparency} 
                            onChange={e => onUpdate({ ...config, pngTransparency: e.target.checked })} 
                            className={`h-5 w-5 bg-brand-gray-700 border-brand-gray-600 rounded ${checkboxClass} ring-offset-brand-gray-900`} 
                        />
                    </div>
                    <div className="ml-3 text-sm">
                        <label htmlFor={`${idPrefix}_pngTransparency`} className="font-medium text-white">Preserve transparency (PNG-24)</label>
                        <p className="text-brand-gray-400 mt-0.5">Keep transparent background (uncheck to flatten with white background)</p>
                    </div>
                </div>
            )}

            {format === SaveFormat.TIFF && (
                <div className="space-y-4 p-4 bg-brand-gray-900/50 rounded-xl border border-brand-gray-700/50">
                    <div>
                        <label className="block text-sm font-medium text-brand-gray-300 mb-1.5">TIFF Compression</label>
                        <select value={tiffCompression} onChange={e => onUpdate({ ...config, tiffCompression: e.target.value as 'NONE' | 'LZW' | 'ZIP'})} className={`w-full bg-brand-gray-800 border border-brand-gray-600 rounded-lg p-2 text-white ${focusRingClass}`}>
                        {TIFF_COMPRESSION_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                    <div className="flex items-start">
                        <div className="flex h-5 items-center">
                            <input 
                                id={`${idPrefix}_tiffTransparency`} 
                                type="checkbox" 
                                checked={tiffTransparency} 
                                onChange={e => onUpdate({ ...config, tiffTransparency: e.target.checked })} 
                                className={`h-4 w-4 bg-brand-gray-700 border-brand-gray-600 rounded ${checkboxClass} ring-offset-brand-gray-900`} 
                            />
                        </div>
                        <div className="ml-2.5">
                             <label htmlFor={`${idPrefix}_tiffTransparency`} className="text-sm text-brand-gray-300 block">Preserve transparency</label>
                        </div>
                    </div>
                    
                    <div className="pt-3 border-t border-brand-gray-700/50">
                        <label className="block text-sm font-medium text-brand-gray-300 mb-2">Layer Options</label>
                        <div className="space-y-2">
                            <div className="flex items-center">
                                 <input 
                                    id={`${idPrefix}_tiff_flattened`} 
                                    name={`${idPrefix}_tiff_layers`} 
                                    type="radio" 
                                    checked={!psdTiffLayers} 
                                    onChange={() => onUpdate({ ...config, psdTiffLayers: false })}
                                    className={`h-4 w-4 bg-brand-gray-700 border-brand-gray-600 ${checkboxClass} ring-offset-brand-gray-900`} 
                                />
                                <label htmlFor={`${idPrefix}_tiff_flattened`} className="ml-2 text-sm text-brand-gray-300">Save Flattened</label>
                            </div>
                            <div className="flex items-center">
                                <input 
                                    id={`${idPrefix}_tiff_unflattened`} 
                                    name={`${idPrefix}_tiff_layers`} 
                                    type="radio" 
                                    checked={!!psdTiffLayers} 
                                    onChange={() => onUpdate({ ...config, psdTiffLayers: true })}
                                    className={`h-4 w-4 bg-brand-gray-700 border-brand-gray-600 ${checkboxClass} ring-offset-brand-gray-900`} 
                                />
                                <label htmlFor={`${idPrefix}_tiff_unflattened`} className="ml-2 text-sm text-brand-gray-300">Save Un-flattened</label>
                            </div>
                        </div>
                         {!psdTiffLayers && tiffTransparency && (
                            <p className={`text-xs text-${accentColor}-400 mt-2 pl-6 italic`}>
                               * Will use &apos;Merge Visible&apos; instead of Flatten to keep transparency.
                            </p>
                         )}
                    </div>
                </div>
            )}
            
            {format === SaveFormat.PSD && (
                <div className="flex items-start p-4 bg-brand-gray-900/50 rounded-xl border border-brand-gray-700/50">
                     <div className="flex h-5 items-center">
                        <input 
                            id={`${idPrefix}_psdTiffLayers`} 
                            type="checkbox" 
                            checked={psdTiffLayers} 
                            onChange={e => onUpdate({ ...config, psdTiffLayers: e.target.checked })} 
                            className={`h-4 w-4 bg-brand-gray-700 border-brand-gray-600 rounded ${checkboxClass} ring-offset-brand-gray-900`} 
                        />
                    </div>
                    <label htmlFor={`${idPrefix}_psdTiffLayers`} className="ml-2.5 text-sm text-brand-gray-300">Save with layers (un-flattened)</label>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-brand-gray-300 mb-1.5">Filename Suffix</label>
                    <div className="flex rounded-lg shadow-sm">
                        <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-brand-gray-600 bg-brand-gray-800 text-brand-gray-400 text-sm">
                            filename
                        </span>
                        <input type="text" placeholder="_resized" value={appendSuffix} onChange={e => onUpdate({ ...config, appendSuffix: e.target.value })} className={`flex-1 min-w-0 block w-full px-4 py-2.5 rounded-none rounded-r-lg bg-brand-gray-900 border border-brand-gray-600 text-white ${focusRingClass}`} />
                    </div>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-brand-gray-300 mb-1.5">Subfolder (Optional)</label>
                    <input type="text" placeholder="e.g., thumbnails" value={subfolder} onChange={e => onUpdate({ ...config, subfolder: e.target.value })} className={`w-full bg-brand-gray-900 border border-brand-gray-600 rounded-lg px-4 py-2.5 text-white ${focusRingClass}`} />
                    <p className="text-xs text-brand-gray-500 mt-1.5">Supports local folders or UNC paths (e.g., \\server\share).</p>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-brand-gray-300 mb-2">On Filename Conflict</label>
                <div className="flex p-1 bg-brand-gray-900 rounded-lg border border-brand-gray-600">
                    <button 
                        onClick={() => onUpdate({ ...config, conflictResolution: FileNameConflictResolution.OVERWRITE })}
                        className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${conflictResolution === FileNameConflictResolution.OVERWRITE ? activeBtnClass : 'text-brand-gray-400 hover:text-white hover:bg-brand-gray-800'}`}>
                        Overwrite
                    </button>
                    <div className="w-px bg-brand-gray-700 my-1"></div>
                    <button 
                        onClick={() => onUpdate({ ...config, conflictResolution: FileNameConflictResolution.PROMPT })}
                        className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${conflictResolution === FileNameConflictResolution.PROMPT ? activeBtnClass : 'text-brand-gray-400 hover:text-white hover:bg-brand-gray-800'}`}>
                        Ask Me
                    </button>
                    <div className="w-px bg-brand-gray-700 my-1"></div>
                    <button 
                        onClick={() => onUpdate({ ...config, conflictResolution: FileNameConflictResolution.APPEND_SUFFIX })}
                        className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${conflictResolution === FileNameConflictResolution.APPEND_SUFFIX ? activeBtnClass : 'text-brand-gray-400 hover:text-white hover:bg-brand-gray-800'}`}>
                        Add Suffix
                    </button>
                </div>
            </div>
        </div>
    );
};


const ResizeModal: React.FC<ResizeModalProps> = ({ isOpen, onClose, onSave, existingAction }) => {
  // --- Form State ---
  const [mode, setMode] = useState<ResizeMode>(ResizeMode.DIMENSIONS);
  const [width, setWidth] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [length, setLength] = useState<string>('');
  const [unit, setUnit] = useState<ResizeUnit>(ResizeUnit.PIXELS);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState<boolean>(true);
  const [resolution, setResolution] = useState<string>('');
  const [error, setError] = useState<string>('');
  
  // --- Save Logic State ---
  const [shouldSave, setShouldSave] = useState<boolean>(false);
  const [saveLogic, setSaveLogic] = useState<SaveLogic>(SaveLogic.SIMPLE);

  const defaultSimpleSave: SaveConfig = { format: SaveFormat.JPEG, jpegQuality: 8, conflictResolution: FileNameConflictResolution.OVERWRITE };
  const defaultRgbSave: SaveConfig = { format: SaveFormat.JPEG, jpegQuality: 10, appendSuffix: '_rgb', conflictResolution: FileNameConflictResolution.OVERWRITE };
  const defaultCmykSave: SaveConfig = { format: SaveFormat.TIFF, tiffCompression: 'LZW', psdTiffLayers: false, appendSuffix: '_cmyk', conflictResolution: FileNameConflictResolution.OVERWRITE };

  // Simple save config
  const [simpleSaveConfig, setSimpleSaveConfig] = useState<SaveConfig>(defaultSimpleSave);
  
  // Conditional save configs
  const [rgbSaveConfig, setRgbSaveConfig] = useState<SaveConfig>(defaultRgbSave);
  const [cmykSaveConfig, setCmykSaveConfig] = useState<SaveConfig>(defaultCmykSave);


  useEffect(() => {
    if (isOpen) {
      setError('');
      const config = existingAction?.config;
      
      // Populate resize fields
      setMode(config?.mode || ResizeMode.DIMENSIONS);
      setWidth(config?.width?.toString() || '');
      setHeight(config?.height?.toString() || '');
      setLength(config?.length?.toString() || '');
      setUnit(config?.unit || ResizeUnit.PIXELS);
      setMaintainAspectRatio(config?.maintainAspectRatio ?? true);
      setResolution(config?.resolution?.toString() || '');

      // Populate save fields
      const hasAnySaveConfig = !!config?.saveConfig || !!config?.conditionalSaveConfig;
      setShouldSave(hasAnySaveConfig);
      setSaveLogic(config?.saveLogic || SaveLogic.SIMPLE);

      setSimpleSaveConfig(config?.saveConfig || defaultSimpleSave);
      setRgbSaveConfig(config?.conditionalSaveConfig?.onRGB || defaultRgbSave);
      setCmykSaveConfig(config?.conditionalSaveConfig?.onCMYK || defaultCmykSave);

    } else {
        // Full reset on close if not editing
        if (!existingAction) {
            setMode(ResizeMode.DIMENSIONS);
            setWidth(''); setHeight(''); setLength(''); setUnit(ResizeUnit.PIXELS);
            setMaintainAspectRatio(true); setResolution('');
            setShouldSave(false); setSaveLogic(SaveLogic.SIMPLE);
            setSimpleSaveConfig(defaultSimpleSave);
            setRgbSaveConfig(defaultRgbSave);
            setCmykSaveConfig(defaultCmykSave);
        }
    }
  }, [existingAction, isOpen]);

  const handleSave = () => {
    setError('');
    let resizeConfig: ResizeAction['config'];

    if (mode === ResizeMode.LONGEST_EDGE) {
        if (!length || parseInt(length) <= 0) {
            setError("Please provide a positive length for the longest edge.");
            return;
        }
        resizeConfig = {
            mode: ResizeMode.LONGEST_EDGE,
            length: parseInt(length),
            unit,
            maintainAspectRatio: true,
            ...(resolution && parseInt(resolution) > 0 && { resolution: parseInt(resolution) }),
        };
    } else { // DIMENSIONS mode
        if ((!width || parseInt(width) <= 0) && (!height || parseInt(height) <= 0)) {
            setError("Please provide a positive width or height.");
            return;
        }
        resizeConfig = {
            mode: ResizeMode.DIMENSIONS,
            unit,
            maintainAspectRatio,
            ...(width && parseInt(width) > 0 && { width: parseInt(width) }),
            ...(height && parseInt(height) > 0 && { height: parseInt(height) }),
            ...(resolution && parseInt(resolution) > 0 && { resolution: parseInt(resolution) }),
        };
    }
    
    if (shouldSave) {
        resizeConfig.saveLogic = saveLogic;
        if (saveLogic === SaveLogic.SIMPLE) {
            resizeConfig.saveConfig = simpleSaveConfig;
        } else {
            resizeConfig.conditionalSaveConfig = {
                onRGB: rgbSaveConfig,
                onCMYK: cmykSaveConfig,
            };
        }
    }

    const action: ResizeAction = {
        id: existingAction?.id || '',
        type: ActionType.RESIZE,
        config: resizeConfig,
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto p-4">
      <div 
        className="bg-brand-gray-800 rounded-xl shadow-2xl w-full max-w-2xl border border-brand-gray-700 my-8 flex flex-col max-h-[90vh]"
        onKeyDown={handleKeyDown}
      >
        
        {/* Header */}
        <div className="flex items-center gap-5 p-6 border-b border-brand-gray-700 shrink-0">
          <div className="flex-shrink-0 w-14 h-14 bg-brand-blue/10 rounded-2xl flex items-center justify-center border border-brand-blue/20 shadow-sm">
            <ResizeIcon className="w-7 h-7 text-brand-blue" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">{existingAction ? 'Edit' : 'Add'} Resize Step</h2>
            <p className="text-sm text-brand-gray-400 mt-1">Configure image dimensions and optional saving.</p>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-200 text-sm rounded-lg p-4 flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-red-500 mt-0.5 shrink-0">
                         <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div className="font-medium">{error}</div>
                </div>
            )}

            <div className="space-y-5">
                {/* Resize Type Selection */}
                <div>
                    <label className="block text-sm font-medium text-brand-gray-300 mb-2">Resize Method</label>
                    <div className="flex p-1 bg-brand-gray-900 rounded-lg border border-brand-gray-600">
                        <button 
                            onClick={() => setMode(ResizeMode.DIMENSIONS)} 
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${mode === ResizeMode.DIMENSIONS ? 'bg-brand-blue text-white shadow-sm' : 'text-brand-gray-400 hover:text-white hover:bg-brand-gray-800'}`}
                        >
                            By Dimensions
                        </button>
                         <div className="w-px bg-brand-gray-700 my-1"></div>
                        <button 
                            onClick={() => setMode(ResizeMode.LONGEST_EDGE)} 
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${mode === ResizeMode.LONGEST_EDGE ? 'bg-brand-blue text-white shadow-sm' : 'text-brand-gray-400 hover:text-white hover:bg-brand-gray-800'}`}
                        >
                            By Longest Edge
                        </button>
                    </div>
                </div>

                {/* Resize Inputs */}
                <div className="bg-brand-gray-900/50 p-5 rounded-xl border border-brand-gray-700/50 space-y-4">
                    {mode === ResizeMode.DIMENSIONS && (
                    <>
                        <div className="grid grid-cols-3 gap-4 items-end">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-brand-gray-300 mb-1.5">Target Dimensions</label>
                                <div className="flex items-center gap-2">
                                    <input type="number" placeholder="Width" value={width} onChange={e => { setWidth(e.target.value); setError(''); }} className="w-full bg-brand-gray-900 border border-brand-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-brand-blue focus:border-brand-blue transition-colors" />
                                    <span className="text-brand-gray-500 font-medium">×</span>
                                    <input type="number" placeholder="Height" value={height} onChange={e => { setHeight(e.target.value); setError(''); }} className="w-full bg-brand-gray-900 border border-brand-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-brand-blue focus:border-brand-blue transition-colors" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-brand-gray-300 mb-1.5">Unit</label>
                                <select value={unit} onChange={e => setUnit(e.target.value as ResizeUnit)} className="w-full bg-brand-gray-900 border border-brand-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-brand-blue focus:border-brand-blue">
                                    {RESIZE_UNIT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <input 
                                id="aspectRatio" 
                                type="checkbox" 
                                checked={maintainAspectRatio} 
                                onChange={e => setMaintainAspectRatio(e.target.checked)} 
                                className="h-4 w-4 text-brand-blue bg-brand-gray-700 border-brand-gray-600 rounded focus:ring-brand-blue focus:ring-offset-brand-gray-900" 
                            />
                            <label htmlFor="aspectRatio" className="ml-2.5 text-sm text-brand-gray-300 cursor-pointer select-none">Maintain aspect ratio</label>
                        </div>
                    </>
                    )}

                    {mode === ResizeMode.LONGEST_EDGE && (
                        <div className="grid grid-cols-3 gap-4 items-end">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-brand-gray-300 mb-1.5">Target Length</label>
                                <input type="number" placeholder="Length of longest side" value={length} onChange={e => { setLength(e.target.value); setError(''); }} className="w-full bg-brand-gray-900 border border-brand-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-brand-blue focus:border-brand-blue transition-colors" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-brand-gray-300 mb-1.5">Unit</label>
                                <select value={unit} onChange={e => setUnit(e.target.value as ResizeUnit)} className="w-full bg-brand-gray-900 border border-brand-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-brand-blue focus:border-brand-blue">
                                    {RESIZE_UNIT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                            </div>
                        </div>
                    )}
                
                    <div>
                        <label className="block text-sm font-medium text-brand-gray-300 mb-1.5">Resolution (DPI)</label>
                        <input type="number" placeholder="e.g., 72 for web, 300 for print" value={resolution} onChange={e => { setResolution(e.target.value); setError(''); }} className="w-full bg-brand-gray-900 border border-brand-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-brand-blue focus:border-brand-blue transition-colors" />
                    </div>
                </div>
            </div>

             <div className="border-t border-brand-gray-700/50"></div>

            {/* Save Options Toggle */}
            <div className="space-y-4">
                 <div className="flex items-center">
                    <div className="flex h-5 items-center">
                        <input 
                            id="shouldSave" 
                            type="checkbox" 
                            checked={shouldSave} 
                            onChange={e => setShouldSave(e.target.checked)} 
                            className="h-5 w-5 text-brand-blue bg-brand-gray-700 border-brand-gray-600 rounded focus:ring-brand-blue focus:ring-offset-brand-gray-900" 
                        />
                    </div>
                    <div className="ml-3 text-sm">
                        <label htmlFor="shouldSave" className="font-medium text-white text-lg">Save image after resizing</label>
                        <p className="text-brand-gray-400">Automatically save the file to a specific format and folder.</p>
                    </div>
                </div>

                {shouldSave && (
                    <div className="bg-brand-gray-900/30 rounded-xl border border-brand-gray-700 overflow-hidden animate-fadeIn">
                        <div className="p-5 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-brand-gray-300 mb-2">Save Logic</label>
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => setSaveLogic(SaveLogic.SIMPLE)} 
                                        className={`flex-1 flex flex-col items-center justify-center px-4 py-3 rounded-xl border transition-all ${saveLogic === SaveLogic.SIMPLE ? 'bg-brand-blue/10 border-brand-blue text-white ring-1 ring-brand-blue' : 'bg-brand-gray-800 border-brand-gray-600 text-brand-gray-400 hover:bg-brand-gray-750'}`}
                                    >
                                        <span className="text-sm font-bold">Single Action</span>
                                        <span className="text-xs opacity-70 mt-1">Save all files identically</span>
                                    </button>
                                    <button 
                                        onClick={() => setSaveLogic(SaveLogic.CONDITIONAL)} 
                                         className={`flex-1 flex flex-col items-center justify-center px-4 py-3 rounded-xl border transition-all ${saveLogic === SaveLogic.CONDITIONAL ? 'bg-brand-blue/10 border-brand-blue text-white ring-1 ring-brand-blue' : 'bg-brand-gray-800 border-brand-gray-600 text-brand-gray-400 hover:bg-brand-gray-750'}`}
                                    >
                                        <span className="text-sm font-bold">Conditional</span>
                                        <span className="text-xs opacity-70 mt-1">Split by RGB / CMYK</span>
                                    </button>
                                </div>
                            </div>
                            
                            {saveLogic === SaveLogic.SIMPLE ? (
                                <div className="animate-fadeIn pt-2">
                                   <SaveForm config={simpleSaveConfig} onUpdate={setSimpleSaveConfig} idPrefix="simple" accentColor="blue" />
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn pt-2">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 pb-2 border-b border-brand-gray-700">
                                            <div className="w-2 h-2 rounded-full bg-brand-blue"></div>
                                            <span className="text-sm font-bold text-brand-blue uppercase tracking-wider">If RGB</span>
                                        </div>
                                        <div className="pt-2">
                                          <SaveForm config={rgbSaveConfig} onUpdate={setRgbSaveConfig} idPrefix="rgb" accentColor="blue" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 pb-2 border-b border-brand-gray-700">
                                            <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                                            <span className="text-sm font-bold text-pink-500 uppercase tracking-wider">If CMYK</span>
                                        </div>
                                        <div className="pt-2">
                                          <SaveForm config={cmykSaveConfig} onUpdate={setCmykSaveConfig} idPrefix="cmyk" accentColor="pink" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
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
            className="px-6 py-2.5 rounded-lg bg-brand-blue hover:bg-blue-600 text-white font-bold shadow-lg shadow-brand-blue/20 transition-all transform active:scale-95 text-sm"
          >
            {existingAction ? 'Save Changes' : 'Add Resize Step'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResizeModal;
