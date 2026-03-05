
import { SaveFormat, ResizeUnit } from './types';

export const SAVE_FORMAT_OPTIONS = [
    { value: SaveFormat.JPEG, label: 'JPEG' },
    { value: SaveFormat.PNG, label: 'PNG' },
    { value: SaveFormat.TIFF, label: 'TIFF' },
    { value: SaveFormat.PSD, label: 'PSD' },
];

export const RESIZE_UNIT_OPTIONS = [
    { value: ResizeUnit.PIXELS, label: 'Pixels' },
    { value: ResizeUnit.PERCENT, label: 'Percent' },
];

export const TIFF_COMPRESSION_OPTIONS = [
    { value: 'NONE', label: 'None' },
    { value: 'LZW', label: 'LZW' },
    { value: 'ZIP', label: 'ZIP' },
];
