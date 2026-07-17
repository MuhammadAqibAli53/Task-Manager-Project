
export function initDB() {
    return new Promise((resolve) => {
    
        const req = indexedDB.open('TaskAppDB', 1);

    
        req.onupgradeneeded = (event) => {
            const db = event.target.result;
            db.createObjectStore('tasks', { keyPath: 'id' });
        };

        req.onsuccess = (event) => {
            resolve(event.target.result);
        };
    });
}


export async function saveTasksToDB(tasks) {
    const db = await initDB();
    

    const transaction = db.transaction('tasks', 'readwrite');
    const store = transaction.objectStore('tasks');
    

    store.clear(); 
    

    tasks.forEach(task => {
        store.put(task);
    });
}


export async function loadTasksFromDB() {
    const db = await initDB();
    
    return new Promise((resolve) => {
  
        
        const trans = db.transaction('tasks', 'readonly');
        const store = trans.objectStore('tasks');
        

        const req = store.getAll();
        
        req.onsuccess = () => {
            resolve(req.result);
        };
    });
}