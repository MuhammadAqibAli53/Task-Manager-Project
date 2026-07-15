
export function initDB() {
    return new Promise((resolve) => {
        // Open a database named 'TaskAppDB'
        const request = indexedDB.open('TaskAppDB', 1);

        // If it's the user's first time, create a table called 'tasks'
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            db.createObjectStore('tasks', { keyPath: 'id' });
        };

        // When it successfully opens, return the database connection
        request.onsuccess = (event) => {
            resolve(event.target.result);
        };
    });
}

// 2. SAVE TASKS TO THE DATABASE
export async function saveTasksToDB(tasks) {
    const db = await initDB();
    
    // Open the table in "readwrite" mode so we can edit it
    const transaction = db.transaction('tasks', 'readwrite');
    const store = transaction.objectStore('tasks');
    
    // Wipe the old data clean
    store.clear(); 
    
    // Save every single task in our new array
    tasks.forEach(task => {
        store.put(task);
    });
}

// 3. LOAD TASKS FROM THE DATABASE
export async function loadTasksFromDB() {
    const db = await initDB();
    
    return new Promise((resolve) => {
  
        
        const transaction = db.transaction('tasks', 'readonly');
        const store = transaction.objectStore('tasks');
        
        // Grab every single row in the table
        const request = store.getAll();
        
        // When it finishes grabbing them, return the array of tasks!
        request.onsuccess = () => {
            resolve(request.result);
        };
    });
}