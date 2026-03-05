
import React, { createContext, useReducer, useContext, Dispatch } from 'react';
import { appReducer, AppState, AppAction } from './reducer';

const initialState: AppState = {
  actions: [],
  outputFolderName: 'ProcessedImages',
  generatedScript: '',
  isLoading: false,
  loadingMessage: '',
  error: '',
  modal: {
    type: null,
    editingId: null,
  },
};

const AppStateContext = createContext<AppState>(initialState);
const AppDispatchContext = createContext<Dispatch<AppAction>>(() => null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
};

export const useAppState = () => useContext(AppStateContext);
export const useAppDispatch = () => useContext(AppDispatchContext);
