
import { store } from '../../core/store.js';

export function initThemeToggle() {
    const themeBtn = document.getElementById('theme-toggle');
    

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
           
            const currentTheme = store.get().theme;
            
           
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
           
            store.set({ theme: newTheme });
        });
    }

 
    store.watch((data) => {
        document.documentElement.setAttribute('data-theme', data.theme);
    });
    

    document.documentElement.setAttribute('data-theme', store.get().theme);
}