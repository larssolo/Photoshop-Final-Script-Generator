
import React, { useCallback, useRef, useState } from 'react';
import { Action, ActionType, ResizeAction, SaveAction, CreateFolderAction, RotateAction, ColorModeAction, ConditionAction, TrimAction, FlattenAction } from './types';
import { generateScriptPrompt, parseScriptToActions } from './services/geminiService';
import Header from './components/Header';
import ActionStep from './components/ActionStep';
import ResizeModal from './components/modals/ResizeModal';
import SaveModal from './components/modals/SaveModal';
import CreateFolderModal from './components/modals/CreateFolderModal';
import RotateModal from './components/modals/RotateModal';
import ColorModeModal from './components/modals/ColorModeModal';
import ConditionModal from './components/modals/ConditionModal';
import TrimModal from './components/modals/TrimModal';
import CodeBlock from './components/CodeBlock';
import UserGuide from './components/UserGuide';
import { PlusIcon, SparklesIcon, DownloadIcon, BranchIcon, ScissorsIcon, FlattenIcon } from './components/icons/Icons';
import { useAppState, useAppDispatch } from './state/AppContext';

const App: React.FC = () => {
  const { 
    actions, 
    outputFolderName,
    generatedScript,
    isLoading,
    loadingMessage,
    error,
    modal 
  } = useAppState();
  const dispatch = useAppDispatch();
  
  // Import file refs
  const importScriptRef = useRef<HTMLInputElement>(null);

  const handleAddAction = (newAction: Action, parentId?: string) => {
    if (modal.editingId) {
      dispatch({ type: 'UPDATE_ACTION', payload: { id: modal.editingId, action: newAction } });
    } else {
      dispatch({ type: 'ADD_ACTION', payload: { action: newAction, parentId } });
    }
  };

  const handleEditAction = (id: string) => {
    dispatch({ type: 'OPEN_MODAL_FOR_EDIT', payload: id });
  };

  const handleDeleteAction = (id: string) => {
    dispatch({ type: 'DELETE_ACTION', payload: id });
  };
  
  const handleGenerateScript = useCallback(async () => {
    if (actions.length === 0) {
      dispatch({ type: 'SET_ERROR', payload: 'Please add at least one step before generating the script.' });
      return;
    }
    if (!outputFolderName) {
      dispatch({ type: 'SET_ERROR', payload: 'Please provide a name for the output folder.' });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: { isLoading: true, message: 'Generating...' } });
    dispatch({ type: 'SET_GENERATED_SCRIPT', payload: '' });

    try {
      const script = await generateScriptPrompt(actions, outputFolderName);
      dispatch({ type: 'SET_GENERATED_SCRIPT', payload: script });
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        dispatch({ type: 'SET_ERROR', payload: e.message });
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'An error occurred while generating the script. Please try again.' });
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { isLoading: false } });
    }
  }, [actions, outputFolderName, dispatch]);

  const dragItem = useRef<Action | null>(null);
  const [dropIndicator, setDropIndicator] = useState<{ id: string; position: 'before' | 'after' | 'inside' } | null>(null);

  const isContainerType = (type: ActionType) =>
    type === ActionType.CONDITION || type === ActionType.CREATE_FOLDER || type === ActionType.TRIM;

  const isDescendant = (ancestor: Action, targetId: string): boolean => {
    if (isContainerType(ancestor.type)) {
      for (const child of (ancestor as any).then) {
        if (child.id === targetId || isDescendant(child, targetId)) return true;
      }
    }
    return false;
  };

  const getDropPosition = (e: React.DragEvent<HTMLDivElement>, isContainer: boolean): 'before' | 'after' | 'inside' => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relY = (e.clientY - rect.top) / rect.height;
    if (isContainer) {
      if (relY < 0.3) return 'before';
      if (relY > 0.7) return 'after';
      return 'inside';
    }
    return relY < 0.5 ? 'before' : 'after';
  };

  const handleDragStart = (action: Action) => {
    dragItem.current = action;
  };

  const handleDragEnd = () => {
    dragItem.current = null;
    setDropIndicator(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, action: Action) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragItem.current || dragItem.current.id === action.id) return;
    if (isDescendant(dragItem.current, action.id)) return;
    const position = getDropPosition(e, isContainerType(action.type));
    setDropIndicator(prev =>
      prev?.id === action.id && prev?.position === position ? prev : { id: action.id, position }
    );
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, action: Action) => {
    e.preventDefault();
    e.stopPropagation();
    const dragged = dragItem.current;
    dragItem.current = null;
    setDropIndicator(null);
    if (!dragged || dragged.id === action.id) return;
    if (isDescendant(dragged, action.id)) return;
    const position = getDropPosition(e, isContainerType(action.type));
    dispatch({ type: 'MOVE_ACTION', payload: { draggedId: dragged.id, targetId: action.id, position } });
  };

  const handleDropZoneOver = (e: React.DragEvent<HTMLDivElement>, containerId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragItem.current) return;
    setDropIndicator(prev =>
      prev?.id === containerId && prev?.position === 'inside' ? prev : { id: containerId, position: 'inside' }
    );
  };

  const handleDropZoneDrop = (e: React.DragEvent<HTMLDivElement>, containerId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const dragged = dragItem.current;
    dragItem.current = null;
    setDropIndicator(null);
    if (!dragged) return;
    dispatch({ type: 'MOVE_ACTION', payload: { draggedId: dragged.id, targetId: containerId, position: 'inside' } });
  };


  const handleDownloadScript = () => {
    if (!generatedScript) return;
    const blob = new Blob([generatedScript], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'photoshop-script.jsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleTriggerImportScript = () => {
    importScriptRef.current?.click();
  };

  const handleImportScript = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        const content = e.target?.result as string;
        if (!content) {
            dispatch({ type: 'SET_ERROR', payload: 'Could not read the file.' });
            return;
        }

        dispatch({ type: 'SET_LOADING', payload: { isLoading: true, message: 'Analyzing script...' } });

        try {
            const parsedData = await parseScriptToActions(content);
            dispatch({
                type: 'LOAD_IMPORTED_DATA',
                payload: {
                    actions: parsedData.actions,
                    outputFolderName: parsedData.outputFolderName,
                    script: content,
                }
            });
        } catch (err) {
            console.error(err);
            if (err instanceof Error) {
                dispatch({ type: 'SET_ERROR', payload: err.message });
            } else {
                dispatch({ type: 'SET_ERROR', payload: 'An unknown error occurred during import. Please try again.' });
            }
        } finally {
            dispatch({ type: 'SET_LOADING', payload: { isLoading: false } });
        }
    };
    reader.onerror = () => {
        dispatch({ type: 'SET_ERROR', payload: 'Error reading file.' });
    };
    reader.readAsText(file);

    event.target.value = '';
  };
  
  const findActionById = (actions: Action[], id: string): Action | undefined => {
    for (const action of actions) {
        if (action.id === id) return action;
        if (action.type === ActionType.CONDITION || action.type === ActionType.CREATE_FOLDER || action.type === ActionType.TRIM) {
            const found = findActionById(action.then, id);
            if (found) return found;
        }
    }
    return undefined;
  };

  const currentAction = modal.editingId ? findActionById(actions, modal.editingId) : undefined;
  
  const renderActions = (actionList: Action[], level = 0) => {
    return actionList.map((action) => {
      const isContainer = action.type === ActionType.CONDITION || action.type === ActionType.CREATE_FOLDER || action.type === ActionType.TRIM;
      return (
        <ActionStep
          key={action.id}
          action={action}
          onEdit={() => handleEditAction(action.id)}
          onDelete={() => handleDeleteAction(action.id)}
          onDragStart={() => handleDragStart(action)}
          onDragOver={(e) => handleDragOver(e, action)}
          onDrop={(e) => handleDrop(e, action)}
          onDropZoneOver={isContainer ? (e) => handleDropZoneOver(e, action.id) : undefined}
          onDropZoneDrop={isContainer ? (e) => handleDropZoneDrop(e, action.id) : undefined}
          onDragEnd={handleDragEnd}
          dropIndicator={dropIndicator?.id === action.id ? dropIndicator.position : null}
          level={level}
        >
          {isContainer && action.then && renderActions(action.then, level + 1)}
        </ActionStep>
      );
    });
  };


  return (
    <div className="min-h-screen bg-brand-gray-900 font-sans">
      <Header onImportClick={handleTriggerImportScript} />
      <main className="container mx-auto p-4 md:p-8">
      <input type="file" ref={importScriptRef} onChange={handleImportScript} accept=".jsx" className="hidden" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Panel: Builder */}
          <div className="bg-brand-gray-800 rounded-lg p-6 shadow-lg border border-brand-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-white">Script Builder</h2>
            <p className="text-brand-gray-300 mb-6">Add and configure steps for your batch script.</p>
            
            <div className="mb-6">
                <label htmlFor="outputFolder" className="block text-sm font-medium text-brand-gray-300 mb-2">
                    Output Folder Name
                </label>
                <input
                    id="outputFolder"
                    type="text"
                    value={outputFolderName}
                    onChange={(e) => dispatch({ type: 'SET_OUTPUT_FOLDER_NAME', payload: e.target.value })}
                    className="w-full bg-brand-gray-900 border border-brand-gray-600 rounded-md p-2 text-white focus:ring-brand-blue focus:border-brand-blue"
                    placeholder="e.g., ProcessedImages"
                />
                <p className="text-xs text-brand-gray-400 mt-2">This is the name of the main folder where all saved files will be placed.</p>
            </div>
            <div className="border-t border-brand-gray-700 mb-6"></div>

            <div className="flex flex-col gap-2">
              {actions.length > 0 ? (
                renderActions(actions)
              ) : (
                <div className="text-center py-10 border-2 border-dashed border-brand-gray-600 rounded-lg">
                  <p className="text-brand-gray-400">Your script steps will appear here.</p>
                  <p className="text-brand-gray-500 text-sm">Start by adding a step or importing a script.</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              <button 
                onClick={() => dispatch({ type: 'OPEN_MODAL_FOR_CREATE', payload: 'resize' })}
                className="flex items-center justify-center gap-2 bg-brand-blue hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200"
              >
                <PlusIcon /> Resize
              </button>
              <button 
                onClick={() => dispatch({ type: 'OPEN_MODAL_FOR_CREATE', payload: 'save' })}
                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200"
              >
                <PlusIcon /> Save
              </button>
               <button 
                onClick={() => dispatch({ type: 'OPEN_MODAL_FOR_CREATE', payload: 'create-folder' })}
                className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200"
              >
                <PlusIcon /> Folder
              </button>
               <button 
                onClick={() => dispatch({ type: 'OPEN_MODAL_FOR_CREATE', payload: 'rotate' })}
                className="flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200"
              >
                <PlusIcon /> Rotate
              </button>
               <button 
                onClick={() => dispatch({ type: 'OPEN_MODAL_FOR_CREATE', payload: 'trim' })}
                className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200"
              >
                <ScissorsIcon /> Trim
              </button>
              <button 
                onClick={() => dispatch({ type: 'OPEN_MODAL_FOR_CREATE', payload: 'color-mode' })}
                className="flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200"
              >
                <PlusIcon /> Color Mode
              </button>
               <button
                onClick={() => dispatch({ type: 'OPEN_MODAL_FOR_CREATE', payload: 'condition' })}
                className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200"
              >
                <BranchIcon /> Condition
              </button>
               <button
                onClick={() => {
                  const flattenAction: FlattenAction = { id: '', type: ActionType.FLATTEN, config: {} };
                  dispatch({ type: 'ADD_ACTION', payload: { action: flattenAction } });
                }}
                className="flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200"
              >
                <FlattenIcon /> Flatten
              </button>
            </div>
            
            <div className="mt-8 border-t border-brand-gray-700 pt-6">
               <button 
                onClick={handleGenerateScript}
                disabled={isLoading || actions.length === 0}
                className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 px-4 rounded-lg text-lg transition-all duration-200 transform hover:scale-105"
              >
                <SparklesIcon /> {isLoading ? loadingMessage : 'Generate Script'}
              </button>
              {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
            </div>

          </div>

          {/* Right Panel: Output */}
          <div className="bg-brand-gray-800 rounded-lg p-6 shadow-lg border border-brand-gray-700 flex flex-col">
             <h2 className="text-2xl font-bold mb-4 text-white">
                {generatedScript || isLoading ? 'Generated Script (ExtendScript)' : 'User Guide'}
             </h2>
             <div className="flex-grow">
               {generatedScript || isLoading ? (
                 <CodeBlock script={generatedScript} isLoading={isLoading} loadingMessage={loadingMessage}/>
               ) : (
                 <UserGuide />
               )}
             </div>
             {generatedScript && !isLoading && (
               <div className="mt-4">
                 <button 
                   onClick={handleDownloadScript}
                   className="w-full flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200"
                 >
                   <DownloadIcon /> Download .jsx file
                 </button>
               </div>
             )}
          </div>
        </div>
      </main>

      {modal.type === 'resize' && (
        <ResizeModal 
          isOpen={true} 
          onClose={() => dispatch({ type: 'CLOSE_MODALS' })} 
          onSave={handleAddAction}
          existingAction={currentAction as ResizeAction | undefined}
        />
      )}
      {modal.type === 'save' && (
        <SaveModal 
          isOpen={true}
          onClose={() => dispatch({ type: 'CLOSE_MODALS' })}
          onSave={handleAddAction}
          existingAction={currentAction as SaveAction | undefined}
        />
      )}
      {modal.type === 'create-folder' && (
        <CreateFolderModal
          isOpen={true}
          onClose={() => dispatch({ type: 'CLOSE_MODALS' })}
          onSave={handleAddAction}
          existingAction={currentAction as CreateFolderAction | undefined}
        />
      )}
      {modal.type === 'rotate' && (
        <RotateModal
          isOpen={true}
          onClose={() => dispatch({ type: 'CLOSE_MODALS' })}
          onSave={handleAddAction}
          existingAction={currentAction as RotateAction | undefined}
        />
      )}
       {modal.type === 'color-mode' && (
        <ColorModeModal
          isOpen={true}
          onClose={() => dispatch({ type: 'CLOSE_MODALS' })}
          onSave={handleAddAction}
          existingAction={currentAction as ColorModeAction | undefined}
        />
      )}
      {modal.type === 'condition' && (
        <ConditionModal
          isOpen={true}
          onClose={() => dispatch({ type: 'CLOSE_MODALS' })}
          onSave={handleAddAction}
          existingAction={currentAction as ConditionAction | undefined}
        />
      )}
      {modal.type === 'trim' && (
        <TrimModal
          isOpen={true}
          onClose={() => dispatch({ type: 'CLOSE_MODALS' })}
          onSave={handleAddAction}
          existingAction={currentAction as TrimAction | undefined}
        />
      )}
    </div>
  );
};

export default App;
