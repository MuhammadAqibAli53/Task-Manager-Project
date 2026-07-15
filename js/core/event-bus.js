/**
 * js/core/event-bus.js
 * A lightweight Pub-Sub (Publish-Subscribe) system.
 */

class EventBus {
    constructor() {
        // This object holds lists of functions waiting for a specific event
        // Example: { 'task:created': [func1, func2], 'sync:completed': [func3] }
        this.events = {};
    }

    /**
     * Subscribe to an event.
     * @param {string} eventName - The name of the event to listen for.
     * @param {function} listener - The callback function to run.
     */
    on(eventName, listener) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(listener);
    }

    /**
     * Unsubscribe from an event.
     * @param {string} eventName - The name of the event.
     * @param {function} listener - The specific callback function to remove.
     */
    off(eventName, listener) {
        if (!this.events[eventName]) return;
        
        // Keep all listeners EXCEPT the one we want to remove
        this.events[eventName] = this.events[eventName].filter(l => l !== listener);
    }

    /**
     * Subscribe to an event, but only run the listener ONE time, then remove it.
     * @param {string} eventName - The name of the event.
     * @param {function} listener - The callback function.
     */
    once(eventName, listener) {
        const onceWrapper = (...args) => {
            listener(...args);
            this.off(eventName, onceWrapper); // Delete itself immediately after running
        };
        this.on(eventName, onceWrapper);
    }

    /**
     * Announce an event to the rest of the application.
     * @param {string} eventName - The name of the event.
     * @param {...any} args - Any data you want to pass to the listeners.
     */
    emit(eventName, ...args) {
        if (!this.events[eventName]) return;
        
        // Run every function that was waiting for this event
        this.events[eventName].forEach(listener => {
            try {
                listener(...args);
            } catch (error) {
                console.error(`Error in EventBus listener for ${eventName}:`, error);
            }
        });
    }
}

// Export a single, shared instance for the whole app to use (Singleton pattern)
export const eventBus = new EventBus();