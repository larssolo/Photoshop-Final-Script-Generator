
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Action, ActionType, ResizeAction, SaveAction, CreateFolderAction, RotateAction, ColorModeAction, ConditionAction, TrimAction, FlattenAction, MetadataAction } from './types';
import { generateScriptPrompt, parseScriptToActions, fetchCredits, startCheckout, NeedCreditsError, signInWithEmail, signOut, onAuthStateChange } from './services/aiService';
import Header from './components/Header';
import ActionStep from './components/ActionStep';
import ResizeModal from './components/modals/ResizeModal';
import SaveModal from './components/modals/SaveModal';
import CreateFolderModal from './components/modals/CreateFolderModal';
import RotateModal from './components/modals/RotateModal';
import ColorModeModal from './components/modals/ColorModeModal';
import ConditionModal from './components/modals/ConditionModal';
import TrimModal from './components/modals/TrimModal';
import FlattenModal from './components/modals/FlattenModal';
import MetadataModal from './components/modals/MetadataModal';
import CodeBlock from './components/CodeBlock';
import UserGuide from './components/UserGuide';
import { SparklesIcon, DownloadIcon, BranchIcon, ScissorsIcon, FlattenIcon, MetadataIcon, ResizeIcon, SaveIcon, FolderIcon, RotateIcon, ColorSwatchIcon, ChevronDownIcon } from './components/icons/Icons';
import { useAppState, useAppDispatch } from './state/AppContext';

// ─── Action button definitions ───────────────────────────────────────────────
const ACTION_BUTTONS = [
  { key: 'resize',        label: 'Resize',       Icon: ResizeIcon,      color: 'blue'   },
  { key: 'save',          label: 'Save',         Icon: SaveIcon,        color: 'emerald'},
  { key: 'create-folder', label: 'Folder',       Icon: FolderIcon,      color: 'purple' },
  { key: 'rotate',        label: 'Rotate',       Icon: RotateIcon,      color: 'yellow' },
  { key: 'trim',          label: 'Trim',         Icon: ScissorsIcon,    color: 'orange' },
  { key: 'color-mode',    label: 'Color Mode',   Icon: ColorSwatchIcon, color: 'pink'   },
  { key: 'condition',     label: 'Condition',    Icon: BranchIcon,      color: 'teal'   },
  { key: 'flatten',       label: 'Flatten',      Icon: FlattenIcon,     color: 'cyan'   },
] as const;

const colorMap: Record<string, string> = {
  blue:    'bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 hover:text-blue-200 border-blue-500/20 hover:border-blue-400/50 hover:shadow-blue-500/10',
  emerald: 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 hover:text-emerald-200 border-emerald-500/20 hover:border-emerald-400/50 hover:shadow-emerald-500/10',
  purple:  'bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 hover:text-purple-200 border-purple-500/20 hover:border-purple-400/50 hover:shadow-purple-500/10',
  yellow:  'bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 hover:text-yellow-200 border-yellow-500/20 hover:border-yellow-400/50 hover:shadow-yellow-500/10',
  orange:  'bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 hover:text-orange-200 border-orange-500/20 hover:border-orange-400/50 hover:shadow-orange-500/10',
  pink:    'bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 hover:text-pink-200 border-pink-500/20 hover:border-pink-400/50 hover:shadow-pink-500/10',
  teal:    'bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 hover:text-teal-200 border-teal-500/20 hover:border-teal-400/50 hover:shadow-teal-500/10',
  cyan:    'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 hover:text-cyan-200 border-cyan-500/20 hover:border-cyan-400/50 hover:shadow-cyan-500/10',
  violet:  'bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 hover:text-violet-200 border-violet-500/20 hover:border-violet-400/50 hover:shadow-violet-500/10',
};

const btnBase = 'flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-medium text-sm border transition-all duration-150 active:scale-95 hover:-translate-y-px hover:shadow-lg';


const App: React.FC = () => {
  const { actions, outputFolderName, generatedScript, isLoading, loadingMessage, error, modal } = useAppState();
  const dispatch = useAppDispatch();
  const importScriptRef = useRef<HTMLInputElement>(null);

  const handleAddAction = (newAction: Action, parentId?: string) => {
    if (modal.editingId) {
      dispatch({ type: 'UPDATE_ACTION', payload: { id: modal.editingId, action: newAction } });
    } else {
      dispatch({ type: 'ADD_ACTION', payload: { action: newAction, parentId } });
    }
  };

  const handleEditAction = (id: string) => dispatch({ type: 'OPEN_MODAL_FOR_EDIT', payload: id });
  const handleDeleteAction = (id: string) => dispatch({ type: 'DELETE_ACTION', payload: id });

  const handleGenerateScript = useCallback(async () => {
    if (!user) { setShowLoginModal(true); return; }
    if (actions.length === 0) {
      dispatch({ type: 'SET_ERROR', payload: 'Add at least one step before generating.' });
      return;
    }
    if (!outputFolderName) {
      dispatch({ type: 'SET_ERROR', payload: 'Provide a name for the output folder.' });
      return;
    }
    dispatch({ type: 'SET_LOADING', payload: { isLoading: true, message: 'Generating script…' } });
    dispatch({ type: 'SET_GENERATED_SCRIPT', payload: '' });
    try {
      const script = await generateScriptPrompt(actions, outputFolderName);
      dispatch({ type: 'SET_GENERATED_SCRIPT', payload: script });
      fetchCredits().then(setCredits);
    } catch (e) {
      if (e instanceof NeedCreditsError) {
        setShowPaywall(true);
      } else {
        dispatch({ type: 'SET_ERROR', payload: e instanceof Error ? e.message : 'An error occurred. Please try again.' });
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { isLoading: false } });
    }
  }, [actions, outputFolderName, dispatch]);

  const dragItem = useRef<Action | null>(null);
  const [dropIndicator, setDropIndicator] = useState<{ id: string; position: 'before' | 'after' | 'inside' } | null>(null);
  const [isScriptExpanded, setIsScriptExpanded] = useState(false);
  const [showDownloadOverlay, setShowDownloadOverlay] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paidToast, setPaidToast] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginSent, setLoginSent] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    if (generatedScript) {
      setIsScriptExpanded(false);
      setShowDownloadOverlay(true);
    }
  }, [generatedScript]);

  useEffect(() => {
    const subscription = onAuthStateChange((u) => {
      setUser(u);
      setAuthLoading(false);
      if (u) {
        const params = new URLSearchParams(window.location.search);
        if (params.has('paid')) {
          setPaidToast(true);
          history.replaceState(null, '', window.location.pathname);
        } else if (params.has('canceled')) {
          history.replaceState(null, '', window.location.pathname);
        }
        fetchCredits().then(setCredits);
      } else {
        setCredits(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!paidToast) return;
    const t = setTimeout(() => setPaidToast(false), 4000);
    return () => clearTimeout(t);
  }, [paidToast]);

  const handleBuyCredits = async () => {
    setCheckingOut(true);
    try {
      await startCheckout();
    } catch (e) {
      setCheckingOut(false);
      dispatch({ type: 'SET_ERROR', payload: e instanceof Error ? e.message : 'Checkout failed. Please try again.' });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) return;
    setLoginLoading(true);
    setLoginError('');
    try {
      await signInWithEmail(loginEmail.trim());
      setLoginSent(true);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Could not send login link.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setCredits(null);
    setUser(null);
  };

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

  const handleDragStart = (action: Action) => { dragItem.current = action; };
  const handleDragEnd = () => { dragItem.current = null; setDropIndicator(null); };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, action: Action) => {
    e.preventDefault(); e.stopPropagation();
    if (!dragItem.current || dragItem.current.id === action.id) return;
    if (isDescendant(dragItem.current, action.id)) return;
    const position = getDropPosition(e, isContainerType(action.type));
    setDropIndicator(prev => prev?.id === action.id && prev?.position === position ? prev : { id: action.id, position });
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, action: Action) => {
    e.preventDefault(); e.stopPropagation();
    const dragged = dragItem.current;
    dragItem.current = null; setDropIndicator(null);
    if (!dragged || dragged.id === action.id) return;
    if (isDescendant(dragged, action.id)) return;
    const position = getDropPosition(e, isContainerType(action.type));
    dispatch({ type: 'MOVE_ACTION', payload: { draggedId: dragged.id, targetId: action.id, position } });
  };

  const handleDropZoneOver = (e: React.DragEvent<HTMLDivElement>, containerId: string) => {
    e.preventDefault(); e.stopPropagation();
    if (!dragItem.current) return;
    setDropIndicator(prev => prev?.id === containerId && prev?.position === 'inside' ? prev : { id: containerId, position: 'inside' });
  };

  const handleDropZoneDrop = (e: React.DragEvent<HTMLDivElement>, containerId: string) => {
    e.preventDefault(); e.stopPropagation();
    const dragged = dragItem.current;
    dragItem.current = null; setDropIndicator(null);
    if (!dragged) return;
    dispatch({ type: 'MOVE_ACTION', payload: { draggedId: dragged.id, targetId: containerId, position: 'inside' } });
  };

  const handleDownloadScript = () => {
    if (!generatedScript) return;
    const blob = new Blob([generatedScript], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'photoshop-script.jsx';
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
    setShowDownloadOverlay(false);
  };

  const handleImportScript = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) { setShowLoginModal(true); return; }
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      if (!content) { dispatch({ type: 'SET_ERROR', payload: 'Could not read file.' }); return; }
      dispatch({ type: 'SET_LOADING', payload: { isLoading: true, message: 'Analyzing script…' } });
      try {
        const parsedData = await parseScriptToActions(content);
        dispatch({ type: 'LOAD_IMPORTED_DATA', payload: { actions: parsedData.actions, outputFolderName: parsedData.outputFolderName, script: content } });
        fetchCredits().then(setCredits);
      } catch (err) {
        if (err instanceof NeedCreditsError) {
          setShowPaywall(true);
        } else {
          dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? err.message : 'Import failed. Please try again.' });
        }
      } finally {
        dispatch({ type: 'SET_LOADING', payload: { isLoading: false } });
      }
    };
    reader.onerror = () => dispatch({ type: 'SET_ERROR', payload: 'Error reading file.' });
    reader.readAsText(file);
    event.target.value = '';
  };

  const findActionById = (actions: Action[], id: string): Action | undefined => {
    for (const action of actions) {
      if (action.id === id) return action;
      if (isContainerType(action.type)) {
        const found = findActionById((action as any).then, id);
        if (found) return found;
      }
    }
    return undefined;
  };

  const currentAction = modal.editingId ? findActionById(actions, modal.editingId) : undefined;

  const renderActions = (actionList: Action[], level = 0) => actionList.map((action) => {
    const isContainer = isContainerType(action.type);
    return (
      <ActionStep
        key={action.id} action={action}
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
        {isContainer && (action as any).then && renderActions((action as any).then, level + 1)}
      </ActionStep>
    );
  });

  return (
    <div className="min-h-screen bg-brand-dark font-sans">
      <Header
        onImportClick={() => importScriptRef.current?.click()}
        credits={credits}
        onBuyCredits={() => setShowPaywall(true)}
        user={user}
        onSignIn={() => { setShowLoginModal(true); setLoginSent(false); setLoginEmail(''); setLoginError(''); }}
        onSignOut={handleSignOut}
      />

      <main className="container mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
        <input type="file" ref={importScriptRef} onChange={handleImportScript} accept=".jsx" className="hidden" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── LEFT PANEL: Builder ─────────────────────────────────────── */}
          <div className="panel-surface rounded-2xl border border-brand-gray-700/50 shadow-2xl shadow-black/40 flex flex-col">

            {/* Panel header */}
            <div className="px-6 pt-6 pb-4 border-b border-brand-gray-700/40">
              <h2 className="text-lg font-semibold text-white tracking-tight">Script Builder</h2>
              <p className="text-sm text-brand-gray-400 mt-0.5">Configure the steps for your batch workflow.</p>
            </div>

            <div className="px-6 py-5 flex flex-col gap-5 flex-1">

              {/* Output folder */}
              <div>
                <label htmlFor="outputFolder" className="block text-xs font-semibold text-brand-gray-400 uppercase tracking-wider mb-2">
                  Output Folder Name
                </label>
                <input
                  id="outputFolder"
                  type="text"
                  value={outputFolderName}
                  onChange={(e) => dispatch({ type: 'SET_OUTPUT_FOLDER_NAME', payload: e.target.value })}
                  className="w-full bg-brand-gray-900 border border-brand-gray-700/60 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-brand-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-blue/40 focus:border-brand-blue/60 transition-all duration-150"
                  placeholder="e.g., ProcessedImages"
                />
                <p className="text-xs text-brand-gray-600 mt-1.5">Main folder where all saved files will be placed.</p>
              </div>

              {/* Action list */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-semibold text-brand-gray-400 uppercase tracking-wider">
                    Steps
                    {actions.length > 0 && (
                      <span className="ml-2 bg-brand-gray-700 text-brand-gray-300 text-xs px-2 py-0.5 rounded-full font-normal normal-case tracking-normal">
                        {actions.length}
                      </span>
                    )}
                  </label>
                </div>

                {actions.length > 0 ? (
                  <div className="flex flex-col gap-1.5">
                    {renderActions(actions)}
                  </div>
                ) : (
                  <div className="text-center py-10 border border-dashed border-brand-gray-700/60 rounded-xl bg-brand-gray-900/30">
                    <div className="w-10 h-10 bg-brand-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-5 h-5 text-brand-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    </div>
                    <p className="text-sm text-brand-gray-400 font-medium">No steps yet</p>
                    <p className="text-xs text-brand-gray-600 mt-1">Add steps using the buttons below.</p>
                  </div>
                )}
              </div>

              {/* Add-action buttons */}
              <div>
                <label className="block text-xs font-semibold text-brand-gray-400 uppercase tracking-wider mb-3">
                  Add Step
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {ACTION_BUTTONS.map(({ key, label, Icon, color }) => (
                    <button
                      key={key}
                      onClick={() => dispatch({ type: 'OPEN_MODAL_FOR_CREATE', payload: key })}
                      className={`${btnBase} ${colorMap[color]}`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{label}</span>
                    </button>
                  ))}
                  <button
                    onClick={() => dispatch({ type: 'OPEN_MODAL_FOR_CREATE', payload: 'metadata' })}
                    className={`${btnBase} ${colorMap['violet']} col-span-2 sm:col-span-3 lg:col-span-4`}
                  >
                    <MetadataIcon className="w-4 h-4 flex-shrink-0" />
                    <span>Metadata &amp; Rename</span>
                  </button>
                </div>
              </div>

              {/* Generate button */}
              <div className="pt-1">
                <button
                  onClick={handleGenerateScript}
                  disabled={isLoading || actions.length === 0}
                  className={`w-full flex items-center justify-center gap-2.5 font-semibold py-3.5 px-6 rounded-xl text-white text-base transition-all duration-200 active:scale-[0.98] ${
                    isLoading
                      ? 'shimmer-btn cursor-wait'
                      : actions.length === 0
                        ? 'bg-brand-gray-800 text-brand-gray-600 cursor-not-allowed border border-brand-gray-700/50'
                        : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-lg shadow-indigo-900/50 hover:shadow-indigo-700/40 hover:-translate-y-px'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin flex-shrink-0" />
                      {loadingMessage ?? 'Generating…'}
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="w-5 h-5 flex-shrink-0" />
                      Generate Script
                    </>
                  )}
                </button>

                {generatedScript && !isLoading && (
                  <button
                    onClick={handleDownloadScript}
                    className="mt-3 w-full flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 hover:text-emerald-200 font-medium py-3 px-4 rounded-xl border border-emerald-500/30 hover:border-emerald-400/60 transition-all duration-150 active:scale-[0.98] text-sm hover:-translate-y-px hover:shadow-lg hover:shadow-emerald-500/10"
                  >
                    <DownloadIcon className="w-4 h-4" />
                    Download .jsx file
                  </button>
                )}

                {error && (
                  <div className="mt-3 flex items-start gap-2.5 bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3">
                    <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                    </svg>
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT PANEL: Output ─────────────────────────────────────── */}
          <div className="panel-surface rounded-2xl border border-brand-gray-700/50 shadow-2xl shadow-black/40 flex flex-col">

            {/* Panel header */}
            <div className="px-6 pt-6 pb-4 border-b border-brand-gray-700/40">
              <h2 className="text-lg font-semibold text-white tracking-tight">User Guide</h2>
              <p className="text-sm text-brand-gray-400 mt-0.5">How to use the Script Generator.</p>
            </div>

            <div className="px-6 py-5 flex flex-col flex-1 gap-4">

              {/* Loading state — inline at top while generating */}
              {isLoading && (
                <div className="flex items-center gap-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl px-4 py-3">
                  <div className="w-4 h-4 rounded-full border-2 border-indigo-400/30 border-t-indigo-400 animate-spin flex-shrink-0" />
                  <p className="text-sm text-indigo-200">{loadingMessage ?? 'Generating script…'}</p>
                </div>
              )}

              {/* Generated script — collapsible, user opts in */}
              {generatedScript && !isLoading && (
                <div className="border border-emerald-500/30 bg-emerald-500/5 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setIsScriptExpanded(v => !v)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-emerald-500/10 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </div>
                      <div className="text-left min-w-0">
                        <p className="text-sm font-semibold text-emerald-200">Script ready</p>
                        <p className="text-xs text-emerald-300/70 truncate">
                          {isScriptExpanded ? 'Hide preview' : 'Click to preview the generated code'}
                        </p>
                      </div>
                    </div>
                    <ChevronDownIcon className={`w-4 h-4 text-emerald-300/70 flex-shrink-0 transition-transform duration-200 ${isScriptExpanded ? '' : '-rotate-90'}`} />
                  </button>
                  <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isScriptExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                    <div className="overflow-hidden">
                      <div className="px-3 pb-3">
                        <CodeBlock script={generatedScript} isLoading={false} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex-1">
                <UserGuide />
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-brand-gray-800 mt-6 py-5 text-center">
        <p className="text-xs text-brand-gray-600">
          Built with Claude Anthropic &amp;{' '}
          <a href="https://www.larssohl.dk" target="_blank" rel="noopener noreferrer" className="hover:text-brand-gray-400 transition-colors underline underline-offset-2">
            www.larssohl.dk
          </a>
        </p>
      </footer>

      {/* ── Download overlay ─────────────────────────────────────────── */}
      {showDownloadOverlay && generatedScript && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{ background: 'rgba(2, 30, 14, 0.92)' }}
          onClick={() => setShowDownloadOverlay(false)}
        >
          {/* Stop propagation so clicking the card itself doesn't dismiss */}
          <div
            className="flex flex-col items-center gap-8 px-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Pulsing glow ring */}
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-3xl scale-150 animate-pulse-subtle" />
              <button
                onClick={handleDownloadScript}
                className="relative flex flex-col items-center justify-center gap-5 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.97] text-white rounded-3xl transition-all duration-200 shadow-2xl shadow-emerald-900/80 hover:shadow-emerald-700/60 px-20"
                style={{ minWidth: '480px', height: '230px' }}
              >
                <DownloadIcon className="w-14 h-14 opacity-90" />
                <span className="text-5xl font-bold tracking-tight">Download Script</span>
                <span className="text-emerald-200/60 text-base font-medium -mt-2">photoshop-script.jsx</span>
              </button>
            </div>

            {/* Dismiss + preview options */}
            <div className="flex items-center gap-6">
              <button
                onClick={() => { setShowDownloadOverlay(false); setIsScriptExpanded(true); }}
                className="text-sm text-emerald-300/70 hover:text-emerald-200 transition-colors underline underline-offset-4"
              >
                Preview script
              </button>
              <span className="text-emerald-900 text-xs">·</span>
              <button
                onClick={() => setShowDownloadOverlay(false)}
                className="text-sm text-emerald-300/70 hover:text-emerald-200 transition-colors underline underline-offset-4"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Login modal ─────────────────────────────────────────────────── */}
      {showLoginModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setShowLoginModal(false)}
        >
          <div
            className="relative bg-brand-gray-900 border border-brand-gray-700/60 rounded-2xl shadow-2xl shadow-black/60 p-8 max-w-sm w-full mx-4 flex flex-col gap-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-blue/15 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-brand-blue" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Log ind</h2>
                <p className="text-xs text-brand-gray-400">Dine credits gemmes på din konto</p>
              </div>
            </div>

            {!loginSent ? (
              <form onSubmit={handleLogin} className="flex flex-col gap-3">
                <div>
                  <label className="block text-xs font-semibold text-brand-gray-400 uppercase tracking-wider mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="din@email.dk"
                    required
                    autoFocus
                    className="w-full bg-brand-gray-800 border border-brand-gray-700/60 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-brand-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-blue/40 focus:border-brand-blue/60 transition-all"
                  />
                </div>
                {loginError && (
                  <p className="text-xs text-red-400">{loginError}</p>
                )}
                <button
                  type="submit"
                  disabled={loginLoading || !loginEmail.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-wait text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 active:scale-[0.98]"
                >
                  {loginLoading ? (
                    <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Sender…</>
                  ) : 'Send login-link'}
                </button>
                <p className="text-xs text-brand-gray-500 text-center">
                  Vi sender dig et link — intet password nødvendigt
                </p>
              </form>
            ) : (
              <div className="flex flex-col items-center gap-3 py-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/15 flex items-center justify-center">
                  <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-white">Tjek din email</p>
                <p className="text-xs text-brand-gray-400 text-center">
                  Vi har sendt et login-link til <span className="text-white">{loginEmail}</span>.<br />
                  Klik på linket for at logge ind.
                </p>
              </div>
            )}

            <button
              onClick={() => setShowLoginModal(false)}
              className="text-sm text-brand-gray-500 hover:text-brand-gray-300 transition-colors text-center"
            >
              Luk
            </button>
          </div>
        </div>
      )}

      {/* ── Paywall modal ───────────────────────────────────────────────── */}
      {showPaywall && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setShowPaywall(false)}
        >
          <div
            className="relative bg-brand-gray-900 border border-brand-gray-700/60 rounded-2xl shadow-2xl shadow-black/60 p-8 max-w-sm w-full mx-4 flex flex-col items-center gap-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 flex items-center justify-center">
              <SparklesIcon className="w-7 h-7 text-indigo-400" />
            </div>
            <div className="text-center">
              <h2 className="text-lg font-bold text-white mb-1">Out of credits</h2>
              <p className="text-sm text-brand-gray-400 leading-relaxed">
                You've used all your script generations.<br />
                Buy 4 more for just $2.
              </p>
            </div>
            <button
              onClick={handleBuyCredits}
              disabled={checkingOut}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:opacity-60 disabled:cursor-wait text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-indigo-900/50 transition-all duration-200 active:scale-[0.98]"
            >
              {checkingOut ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Redirecting…
                </>
              ) : (
                'Buy 4 scripts – $2'
              )}
            </button>
            <button
              onClick={() => setShowPaywall(false)}
              className="text-sm text-brand-gray-500 hover:text-brand-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Paid toast ──────────────────────────────────────────────────── */}
      {paidToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 bg-emerald-600 text-white text-sm font-medium px-5 py-3 rounded-full shadow-xl shadow-emerald-900/60 animate-pulse-subtle">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          Payment successful — 4 credits added!
        </div>
      )}

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      {modal.type === 'resize' && <ResizeModal isOpen onClose={() => dispatch({ type: 'CLOSE_MODALS' })} onSave={handleAddAction} existingAction={currentAction as ResizeAction | undefined} />}
      {modal.type === 'save' && <SaveModal isOpen onClose={() => dispatch({ type: 'CLOSE_MODALS' })} onSave={handleAddAction} existingAction={currentAction as SaveAction | undefined} />}
      {modal.type === 'create-folder' && <CreateFolderModal isOpen onClose={() => dispatch({ type: 'CLOSE_MODALS' })} onSave={handleAddAction} existingAction={currentAction as CreateFolderAction | undefined} />}
      {modal.type === 'rotate' && <RotateModal isOpen onClose={() => dispatch({ type: 'CLOSE_MODALS' })} onSave={handleAddAction} existingAction={currentAction as RotateAction | undefined} />}
      {modal.type === 'color-mode' && <ColorModeModal isOpen onClose={() => dispatch({ type: 'CLOSE_MODALS' })} onSave={handleAddAction} existingAction={currentAction as ColorModeAction | undefined} />}
      {modal.type === 'condition' && <ConditionModal isOpen onClose={() => dispatch({ type: 'CLOSE_MODALS' })} onSave={handleAddAction} existingAction={currentAction as ConditionAction | undefined} />}
      {modal.type === 'trim' && <TrimModal isOpen onClose={() => dispatch({ type: 'CLOSE_MODALS' })} onSave={handleAddAction} existingAction={currentAction as TrimAction | undefined} />}
      {modal.type === 'flatten' && <FlattenModal isOpen onClose={() => dispatch({ type: 'CLOSE_MODALS' })} onSave={handleAddAction} existingAction={currentAction as FlattenAction | undefined} />}
      {modal.type === 'metadata' && <MetadataModal isOpen onClose={() => dispatch({ type: 'CLOSE_MODALS' })} onSave={handleAddAction} existingAction={currentAction as MetadataAction | undefined} />}
    </div>
  );
};

export default App;
