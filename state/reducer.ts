
import { Action, ActionType, CreateFolderAction, ConditionAction, TrimAction } from '../types';

export type ModalType = 'resize' | 'save' | 'create-folder' | 'rotate' | 'color-mode' | 'condition' | 'trim' | null;

export interface AppState {
  actions: Action[];
  outputFolderName: string;
  generatedScript: string;
  isLoading: boolean;
  loadingMessage: string;
  error: string;
  modal: {
    type: ModalType;
    editingId: string | null;
  };
}

export type AppAction =
  | { type: 'ADD_ACTION'; payload: { action: Action, parentId?: string } }
  | { type: 'UPDATE_ACTION'; payload: { id: string, action: Action } }
  | { type: 'DELETE_ACTION'; payload: string }
  | { type: 'MOVE_ACTION'; payload: { draggedId: string, targetId: string, position: 'before' | 'after' | 'inside' } }
  | { type: 'SET_ACTIONS'; payload: Action[] }
  | { type: 'SET_OUTPUT_FOLDER_NAME'; payload: string }
  | { type: 'SET_GENERATED_SCRIPT'; payload: string }
  | { type: 'SET_LOADING'; payload: { isLoading: boolean; message?: string } }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'OPEN_MODAL_FOR_CREATE'; payload: ModalType }
  | { type: 'OPEN_MODAL_FOR_EDIT'; payload: string }
  | { type: 'CLOSE_MODALS' }
  | { type: 'LOAD_IMPORTED_DATA'; payload: { actions: Action[], outputFolderName: string, script: string } };

// --- Recursive Helper Functions for Nested State ---

type ContainerAction = CreateFolderAction | ConditionAction | TrimAction;

const isContainerAction = (action: Action): action is ContainerAction => 
    action.type === ActionType.CONDITION || 
    action.type === ActionType.CREATE_FOLDER || 
    action.type === ActionType.TRIM;

const addActionRecursively = (actions: Action[], newAction: Action, parentId?: string): Action[] => {
  if (!parentId) {
    return [...actions, newAction];
  }
  return actions.map(action => {
    if (action.id === parentId && isContainerAction(action)) {
      return { ...action, then: [...action.then, newAction] };
    }
    if (isContainerAction(action)) {
      return { ...action, then: addActionRecursively(action.then, newAction, parentId) };
    }
    return action;
  });
};

const updateActionRecursively = (actions: Action[], id: string, updatedAction: Action): Action[] => {
  return actions.map(action => {
    if (action.id === id) {
      return { ...updatedAction, id: action.id, then: (action as any).then ?? (updatedAction as any).then }; // Preserve ID and children
    }
    if (isContainerAction(action)) {
      return { ...action, then: updateActionRecursively(action.then, id, updatedAction) };
    }
    return action;
  });
};

const deleteActionRecursively = (actions: Action[], id: string): Action[] => {
  const filteredActions = actions.filter(action => action.id !== id);
  return filteredActions.map(action => {
    if (isContainerAction(action)) {
      return { ...action, then: deleteActionRecursively(action.then, id) };
    }
    return action;
  });
};

const findAndRemoveAction = (actions: Action[], id: string): { found: Action | null; updatedActions: Action[] } => {
    let found: Action | null = null;
    const updatedActions = actions.filter(action => {
        if (action.id === id) {
            found = action;
            return false;
        }
        return true;
    }).map(action => {
        if (isContainerAction(action)) {
            const result = findAndRemoveAction(action.then, id);
            if (result.found) {
                found = result.found;
                return { ...action, then: result.updatedActions };
            }
        }
        return action;
    });
    return { found, updatedActions };
};

const insertActionAt = (
  actions: Action[],
  draggedAction: Action,
  targetId: string,
  position: 'before' | 'after' | 'inside',
): { newActions: Action[]; inserted: boolean } => {
  for (let i = 0; i < actions.length; i++) {
    const action = actions[i];

    if (action.id === targetId) {
      const newActions = [...actions];
      if (position === 'inside' && isContainerAction(action)) {
        newActions[i] = { ...action, then: [...action.then, draggedAction] } as Action;
      } else if (position === 'after') {
        newActions.splice(i + 1, 0, draggedAction);
      } else {
        newActions.splice(i, 0, draggedAction);
      }
      return { newActions, inserted: true };
    }

    if (isContainerAction(action)) {
      const result = insertActionAt(action.then, draggedAction, targetId, position);
      if (result.inserted) {
        const newActions = [...actions];
        newActions[i] = { ...action, then: result.newActions } as Action;
        return { newActions, inserted: true };
      }
    }
  }
  return { newActions: actions, inserted: false };
};

// Helper function to find an action by its ID in a nested structure
const findActionById = (actions: Action[], id: string): Action | undefined => {
    for (const action of actions) {
        if (action.id === id) return action;
        if (isContainerAction(action)) {
            const found = findActionById(action.then, id);
            if (found) return found;
        }
    }
    return undefined;
};


export const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'ADD_ACTION': {
      const { action: newAction, parentId } = action.payload;
      const actionWithId = { ...newAction, id: crypto.randomUUID() } as Action;
      if (isContainerAction(actionWithId) && !actionWithId.then) {
        actionWithId.then = [];
      }
      return {
        ...state,
        actions: addActionRecursively(state.actions, actionWithId, parentId),
        generatedScript: '',
        error: '',
      };
    }
    case 'UPDATE_ACTION': {
      return {
        ...state,
        actions: updateActionRecursively(state.actions, action.payload.id, action.payload.action),
        generatedScript: '',
        error: '',
      };
    }
    case 'DELETE_ACTION':
      return {
        ...state,
        actions: deleteActionRecursively(state.actions, action.payload),
        generatedScript: '',
        error: '',
      };
    case 'MOVE_ACTION': {
        const { draggedId, targetId, position } = action.payload;
        if (draggedId === targetId) return state;

        // Prevent dropping a parent container onto one of its own descendants
        const draggedAction = findActionById(state.actions, draggedId);
        if (draggedAction && isContainerAction(draggedAction)) {
            if (findActionById(draggedAction.then, targetId)) return state;
        }

        const { found: foundDraggedAction, updatedActions: actionsWithoutDragged } = findAndRemoveAction(state.actions, draggedId);
        if (!foundDraggedAction) return state;

        const { newActions, inserted } = insertActionAt(actionsWithoutDragged, foundDraggedAction, targetId, position);

        return {
            ...state,
            actions: inserted ? newActions : [...newActions, foundDraggedAction],
            generatedScript: '',
            error: '',
        };
    }
    case 'SET_ACTIONS':
      return {
        ...state,
        actions: action.payload,
        generatedScript: '',
        error: '',
      };
    case 'SET_OUTPUT_FOLDER_NAME':
      return {
        ...state,
        outputFolderName: action.payload,
        generatedScript: '',
        error: '',
      };
    case 'SET_GENERATED_SCRIPT':
      return {
        ...state,
        generatedScript: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload.isLoading,
        loadingMessage: action.payload.message || '',
        error: action.payload.isLoading ? '' : state.error,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case 'OPEN_MODAL_FOR_CREATE':
      return {
        ...state,
        modal: {
          type: action.payload,
          editingId: null,
        },
      };
    case 'OPEN_MODAL_FOR_EDIT': {
        const actionToEdit = findActionById(state.actions, action.payload);

        let modalType: ModalType = null;
        if (actionToEdit) {
            switch(actionToEdit.type) {
                case ActionType.RESIZE: modalType = 'resize'; break;
                case ActionType.SAVE: modalType = 'save'; break;
                case ActionType.CREATE_FOLDER: modalType = 'create-folder'; break;
                case ActionType.ROTATE: modalType = 'rotate'; break;
                case ActionType.COLOR_MODE: modalType = 'color-mode'; break;
                case ActionType.CONDITION: modalType = 'condition'; break;
                case ActionType.TRIM: modalType = 'trim'; break;
            }
        }

        return {
            ...state,
            modal: { type: modalType, editingId: action.payload },
        };
    }
    case 'CLOSE_MODALS':
      return {
        ...state,
        modal: { type: null, editingId: null },
      };
    case 'LOAD_IMPORTED_DATA':
        return {
            ...state,
            actions: action.payload.actions,
            outputFolderName: action.payload.outputFolderName,
            generatedScript: action.payload.script,
            error: '',
        }
    default:
      return state;
  }
};
