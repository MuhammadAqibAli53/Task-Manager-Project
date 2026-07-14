
import { store } from '../../core/store.js';

export function initUndoRedo() {
    const MAX_HISTORY = 20; // Section 9 requirement
    
    let undoStack = [];
    let redoStack = [];
    

    let isNavigatingHistory = false;


    store.watch((data) => {

        if (isNavigatingHistory) {
            isNavigatingHistory = false; 
            return;
        }

        const snapshot = JSON.stringify(data.tasks);

        if (undoStack.length === 0 || undoStack[undoStack.length - 1] !== snapshot) {
            undoStack.push(snapshot);

           
            if (undoStack.length > MAX_HISTORY + 1) {
                undoStack.shift(); 
            }

            redoStack = [];
        }
    });


    document.addEventListener('keydown', (event) => {
     
        const isCtrl = event.ctrlKey || event.metaKey;

        // UNDO: Ctrl + Z (Make sure Shift is NOT pressed)
        if (isCtrl && event.key.toLowerCase() === 'z' && !event.shiftKey) {
            event.preventDefault(); // Stop the browser from just deleting text
            performUndo();
        }

        // REDO: Ctrl + Shift + Z  -OR-  Ctrl + Y
        if (isCtrl && ((event.key.toLowerCase() === 'z' && event.shiftKey) || event.key.toLowerCase() === 'y')) {
            event.preventDefault();
            performRedo();
        }
    });

    // 3. THE UNDO LOGIC
    function performUndo() {
        // We need at least 2 photos to go backward (the current one, and the previous one)
        if (undoStack.length > 1) {
            // Take the current state off the Undo stack and save it for the future
            const currentState = undoStack.pop();
            redoStack.push(currentState);

            // Look at the previous state
            const previousStateStr = undoStack[undoStack.length - 1];
            const previousTasks = JSON.parse(previousStateStr);

            // Update the store! (Turn on the security lock first)
            isNavigatingHistory = true;
            store.set({ tasks: previousTasks });
        }
    }

    // 4. THE REDO LOGIC
    function performRedo() {
        if (redoStack.length > 0) {
            // Grab the future state
            const nextStateStr = redoStack.pop();
            
            // Put it back on the Undo stack
            undoStack.push(nextStateStr);

            const nextTasks = JSON.parse(nextStateStr);

            // Update the store!
            isNavigatingHistory = true;
            store.set({ tasks: nextTasks });
        }
    }
}