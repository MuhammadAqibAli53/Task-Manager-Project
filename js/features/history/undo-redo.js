
import { store } from '../../core/store.js';

export function initUndoRedo() {
    const max = 20;
    
    let undo = [];
    let redo = [];
    

    let history = false;


    store.subscribe((data) => {

        if (history) {
            history = false; 
            return;
        }

        const snap = JSON.stringify(data.tasks);

        if (undo.length === 0 || undo[undo.length - 1] !== snap) {
            undo.push(snap);

           
            if (undo.length > max + 1) {
                undo.shift(); 
            }
            redo = [];
        }
    });


    document.addEventListener('keydown', (event) => {
     
        const isCtrl = event.ctrlKey;

        if (isCtrl && event.key.toLowerCase() === 'z' && !event.shiftKey) {
            event.preventDefault(); 
            undofun();
        }

        
        if (isCtrl && ((event.key.toLowerCase() === 'z' && event.shiftKey) || event.key.toLowerCase() === 'y')) {
            event.preventDefault();
            redofun();
        }
    });

   
    function undofun() {
   
        if (undo.length > 1) {
   
            const currentState = undo.pop();
            redo.push(currentState);

   
            const previousStateStr =undo[undo.length - 1];
          const previousTasks = JSON.parse(previousStateStr);


          history = true;
            store.setState({ tasks: previousTasks });
        }
    }

   
    function redofun() {
        if (redo.length > 0) {
   
        const nextStateStr = redo.pop();    
   
        undo.push(nextStateStr);
            const nextTasks = JSON.parse(nextStateStr);
           history = true;
            store.setState({ tasks: nextTasks });
        }
    }
}