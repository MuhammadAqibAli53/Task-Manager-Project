
import { eventBus } from '../core/event-bus.js';
import {apiClient } from './api-client.js'

class SyncService {
    constructor() {
        this.dbName = 'TaskMasterSyncDB';
        this.storeName = 'offlineQueue';
        this.db = null;
        this.isOnline = navigator.onLine;
        this.syncStatus = this.isOnline ? 'Online' : 'Offline';
    }

    // Initialize IndexedDB queue and window listeners
    async init() {
        await this.initIndexedDB();
        this.setupListeners();
        this.updateStatusDisplay(this.syncStatus);
        await this.updateQueueDisplay();
    }

    // Open or create the IndexedDB database
    initIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);

            request.onerror = () => {
                console.error("IndexedDB error:", request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
                }
            };
        });
    }

    // Listen for browser online/offline events
    setupListeners() {
        window.addEventListener('online', async () => {
            this.isOnline = true;
            this.updateStatusDisplay('Syncing...');
            eventBus.emit('sync:started');
            await this.processQueue();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.updateStatusDisplay('Offline');
            eventBus.emit('notification:show', {
                message: 'You are offline. Changes are saved locally and queued.',
                type: 'warning'
            });
        });
    }

    // Push an operation into the IndexedDB queue when offline
    async queueOperation(actionType, payload) {
        if (!this.db) await this.initIndexedDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(this.storeName, 'readwrite');
            const store = transaction.objectStore(this.storeName);

            const operation = {
                actionType, // e.g., 'CREATE_TASK', 'UPDATE_TASK', 'DELETE_TASK'
                payload,
                timestamp: new Date().toISOString()
            };

            const request = store.add(operation);
            
            request.onsuccess = async () => {
                await this.updateQueueDisplay();
                resolve(request.result);
            };

            request.onerror = () => reject(request.error);
        });
    }

    // Replay queued operations when connectivity returns
    async processQueue() {
        if (!this.db || !this.isOnline) return;

        const operations = await this.getQueuedOperations();
        
        if (operations.length === 0) {
            this.updateStatusDisplay('Synced');
            eventBus.emit('sync:completed');
            return;
        }

        try {
            for (const op of operations) {
                // 1. Send it to the server
                await this.simulateServerSync(op);

                // 2. ONLY if successful, delete it from the local offline queue
                await this.removeOperation(op.id);
                
                // Update the visual log so the user sees it disappearing!
                await this.updateQueueDisplay();
            }

            this.updateStatusDisplay('Synced');
            eventBus.emit('sync:completed');
            
            eventBus.emit('notification:show', {
                message: 'All offline operations synchronized successfully!',
                type: 'success'
            });

        } catch (error) {
            console.error('Synchronization failed:', error);
            this.updateStatusDisplay('Sync Failed');
            eventBus.emit('sync:failed', error);
            // Notice: We do NOT clear the queue here. We let the data stay safe in IndexedDB to try again later!
        }
    }

    getQueuedOperations() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(this.storeName, 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    removeOperation(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(this.storeName, 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // Simulated network sync call
    simulateServerSync(operation) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate occasional random failure for testing resilience
                if (Math.random() < 0.05) {
                    reject(new Error('Server rejection during sync'));
                } else {
                    console.log('Server synced operation:', operation);
                    resolve(true);
                }
            }, 800); // 800ms delay to simulate network travel time
        });
    }


   // the below function will be used if we have the actual backend api link 

  //  async simulateServerSync(operation) {
        
      //  if (operation.actionType === 'CREATE_TASK') {
    //        return await apiClient.post('/tasks', operation.payload);
        //} 
     //   else if (operation.actionType === 'UPDATE_TASK' || operation.actionType === 'MOVE_TASK') {
       //     return await apiClient.put(`/tasks/${operation.payload.id}`, operation.payload);
        //} 
        //else if (operation.actionType === 'DELETE_TASK') {
         //   return await apiClient.delete(`/tasks/${operation.payload.id}`);
        ///}
   // }

    async updateQueueDisplay() {
        const logContainer = document.getElementById('offline-queue-log');
        if (!logContainer) return;

        try {
            const operations = await this.getQueuedOperations();

            if (operations.length === 0) {
                logContainer.innerHTML = '<span style="color: gray;">No pending offline actions.</span>';
                return;
            }

            logContainer.innerHTML = operations.map(op => `
                <div style="background: rgba(var(--primary-rgb), 0.1); padding: 4px 8px; margin-bottom: 4px; border-radius: 4px; border-left: 3px solid var(--primary-color);">
                    <strong>${op.actionType}</strong><br>
                    <span style="opacity: 0.8; font-size: 10px;">${op.payload.title || 'Task'} (${new Date(op.timestamp).toLocaleTimeString()})</span>
                </div>
            `).join('');
        } catch (e) {
            console.error("Could not update queue display", e);
        }
    }

    updateStatusDisplay(status) {
        this.syncStatus = status;
        const badge = document.getElementById('sync-status');

        if (badge) {
            badge.textContent = status;
            badge.className = `status-pill status-pill--${status.toLowerCase().replace(' ', '-').replace('...', '')}`;
        }
    }
}

export const syncService = new SyncService();