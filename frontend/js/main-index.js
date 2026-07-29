import { toggleTheme, applySavedTheme } from './utils/theme.js';
import * as lucide from 'lucide';

lucide.createIcons();
window.toggleTheme = toggleTheme;
applySavedTheme();
