
export enum ActionType {
  RESIZE = 'RESIZE',
  SAVE = 'SAVE',
  CREATE_FOLDER = 'CREATE_FOLDER',
  ROTATE = 'ROTATE',
  COLOR_MODE = 'COLOR_MODE',
  CONDITION = 'CONDITION',
  TRIM = 'TRIM',
}

export enum ResizeUnit {
  PIXELS = 'px',
  PERCENT = '%',
}

export enum ResizeMode {
  DIMENSIONS = 'DIMENSIONS',
  LONGEST_EDGE = 'LONGEST_EDGE',
}

export enum SaveFormat {
  JPEG = 'JPEG',
  PNG = 'PNG',
  TIFF = 'TIFF',
  PSD = 'PSD',
}

export enum RotationType {
  CW_90 = 'CW_90',
  CCW_90 = 'CCW_90',
  DEG_180 = '180',
}

export enum ColorProfile {
  RGB = 'RGB',
  CMYK = 'CMYK',
  GRAYSCALE = 'GRAYSCALE',
}

export enum TrimBasedOn {
    TRANSPARENT_PIXELS = 'TRANSPARENT_PIXELS',
    TOP_LEFT_PIXEL_COLOR = 'TOP_LEFT_PIXEL_COLOR',
    BOTTOM_RIGHT_PIXEL_COLOR = 'BOTTOM_RIGHT_PIXEL_COLOR',
}

export enum ConditionProperty {
  WIDTH = 'WIDTH',
  HEIGHT = 'HEIGHT',
  FILENAME = 'FILENAME',
  FILETYPE = 'FILETYPE',
  COLOR_MODE = 'COLOR_MODE',
}

export enum ConditionOperator {
  GREATER_THAN = 'GREATER_THAN',
  LESS_THAN = 'LESS_THAN',
  CONTAINS = 'CONTAINS',
  DOES_NOT_CONTAIN = 'DOES_NOT_CONTAIN',
  IS = 'IS',
  IS_NOT = 'IS_NOT',
}

export enum SaveLogic {
  SIMPLE = 'SIMPLE',
  CONDITIONAL = 'CONDITIONAL',
}

export enum FileNameConflictResolution {
  OVERWRITE = 'OVERWRITE',
  PROMPT = 'PROMPT',
  APPEND_SUFFIX = 'APPEND_SUFFIX',
}

export interface SaveConfig {
  format: SaveFormat;
  jpegQuality?: number;
  pngTransparency?: boolean;
  tiffCompression?: 'NONE' | 'LZW' | 'ZIP';
  tiffTransparency?: boolean;
  psdTiffLayers?: boolean;
  appendSuffix?: string;
  subfolder?: string;
  conflictResolution?: FileNameConflictResolution;
}

export interface ResizeAction {
  id: string;
  type: ActionType.RESIZE;
  config: {
    mode: ResizeMode;
    width?: number;
    height?: number;
    length?: number; // For longest edge
    unit: ResizeUnit;
    maintainAspectRatio: boolean;
    resolution?: number; // DPI
    
    // New save logic properties
    saveLogic?: SaveLogic;
    saveConfig?: SaveConfig;
    conditionalSaveConfig?: {
        onRGB?: SaveConfig;
        onCMYK?: SaveConfig;
    };
  };
}

export interface SaveAction {
  id: string;
  type: ActionType.SAVE;
  config: SaveConfig;
}

export interface CreateFolderAction {
  id: string;
  type: ActionType.CREATE_FOLDER;
  config: {
    folderName: string;
  };
  then: Action[];
}

export interface RotateAction {
    id: string;
    type: ActionType.ROTATE;
    config: {
        rotation: RotationType;
    };
}

export interface ColorModeAction {
    id: string;
    type: ActionType.COLOR_MODE;
    config: {
        profile: ColorProfile;
    };
}

export interface TrimAction {
    id: string;
    type: ActionType.TRIM;
    config: {
        basedOn: TrimBasedOn;
        top: boolean;
        bottom: boolean;
        left: boolean;
        right: boolean;
    };
    then: Action[];
}

export interface Condition {
    property: ConditionProperty;
    operator: ConditionOperator;
    value: string | number;
}

export interface ConditionAction {
    id: string;
    type: ActionType.CONDITION;
    config: {
        condition: Condition;
    };
    then: Action[];
}


export type Action = ResizeAction | SaveAction | CreateFolderAction | RotateAction | ColorModeAction | ConditionAction | TrimAction;

export interface Preset {
  name: string;
  actions: Action[];
  outputFolderName: string;
}
