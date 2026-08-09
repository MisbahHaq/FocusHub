import '../css/styles.css';

import { toggleTheme, applySavedTheme } from './utils/theme.js';
import { createIcons, icons } from 'lucide';

createIcons({icons});
window.toggleTheme = toggleTheme;
applySavedTheme();
