/**
 * js/services/api-client.js
 * Handles fetching data from our JSON files.
 */

export async function fetchInitialTasks() {
    try {
        // Fetch the JSON file
        const response = await fetch('./data/tasks.json');
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        // Convert the response to a JavaScript array
        const tasks = await response.json();
        return tasks;

    } catch (error) {
        console.error('Failed to load tasks:', error);
        return []; // Return an empty array if something breaks
    }
}