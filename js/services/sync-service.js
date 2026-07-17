
import { eventBus } from '../core/event-bus.js';
import {apiClient } from './api-client.js'

class SyncService {
    constructor() {
        this.dbName = 'Offlinedb';
        this.storeName = 'offlineQueue';
        this.db = null;
        this.isOnline = navigator.onLine;
        this.syncStatus = this.isOnline ? 'Online' : 'Offline';
    }

    
    async init() {
        await this.initIndexedDB();
        this.listenOnline();
        this.updateStatusDisplay(this.syncStatus);
        await this.updatequeuedisplay();
    }

    
    initIndexedDB() {
        return new Promise((resolve, reject) => {
            const req = indexedDB.open(this.dbName, 1);

            req.onerror = () => {
                console.error("IndexedDB error:", req.error);
                reject(req.error);
            };

            req.onsuccess = () => {
                this.db = req.result;
                resolve(this.db);
            };

            req.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
                }
            };
        });
    }

    
    listenOnline() {
        window.addEventListener('online', async () => {
            this.isOnline = true;
            
    
            eventBus.emit('notification:clear'); 
            
            this.updateStatusDisplay('Syncing...');
            eventBus.emit('sync:started');
            await this.processQueue();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.updateStatusDisplay('Offline');
            
            eventBus.emit('notification:show', {
                message: 'You are offline. Changes are saved locally and queued.',
                type: 'warning',
                duration: 0 
            });
        });
    }

    
    async queueOperation(actionType, payload) {
        if (!this.db) await this.initIndexedDB();

        return new Promise((resolve, reject) => {
            const trans = this.db.transaction(this.storeName, 'readwrite');
            const store = trans.objectStore(this.storeName);

            const operation = {
                actionType, 
                payload,
                timestamp: new Date().toISOString()
            };

            const request = store.add(operation);
            
            request.onsuccess = async () => {
                await this.updatequeuedisplay();
                resolve(request.result);
            };

            request.onerror = () => reject(request.error);
        });
    }

    
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
               
                await this.removetask(op.id);
               
                await this.updatequeuedisplay();
            }

            this.updateStatusDisplay('Synced');
            eventBus.emit('sync:completed');
            
            eventBus.emit('notification:show', {
                message: 'All offline operations synchronized successfully!',
                type: 'success'
            });
            setTimeout(() => {
                if (this.isOnline) {
                    this.updateStatusDisplay('Online');
                }
            }, 3000);

        } catch (error) {
            console.error('Synchronization failed:', error);
            this.updateStatusDisplay('Sync Failed');
            eventBus.emit('sync:failed', error);
          
            
            if (this.isOnline) {
                console.log("Server failed. Retrying sync in 5 seconds...");
                
                setTimeout(() => {
                
                    this.updateStatusDisplay('Syncing...'); 
                    this.processQueue();
                }, 5000);
            }
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

    removetask(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(this.storeName, 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

   
 

   // the below function will be used if we have the actual backend api link 
/*
    async simulateServerSync(operation) {
        
        if (operation.actionType === 'CREATE_TASK') {
            return await apiClient.post('/tasks', operation.payload);
    } 
       else if (operation.actionType === 'UPDATE_TASK' || operation.actionType === 'MOVE_TASK') {
          return await apiClient.put(`/tasks/${operation.payload.id}`, operation.payload);
     } 
     else if (operation.actionType === 'DELETE_TASK') {
       return await apiClient.delete(`/tasks/${operation.payload.id}`);
     }
    }
*/
    async updatequeuedisplay() {
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