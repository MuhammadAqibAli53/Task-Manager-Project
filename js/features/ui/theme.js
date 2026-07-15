
import { store } from '../../core/store.js';

export function initThemeToggle() {
    const themeBtn = document.getElementById('theme-toggle');
    

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
           
            const currentTheme = store.getState().theme;
            
           
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            store.setState({ theme: newTheme });
        });
    }

 
    store.subscribe((data) => {
        document.documentElement.setAttribute('data-theme', data.theme);
    });
    

    document.documentElement.setAttribute('data-theme', store.getState().theme);
}