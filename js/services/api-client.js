
export class APIError extends Error {
    constructor(message, status = 500, data = null) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.data = data;
    }
}

class ApiClient {
    constructor(baseURL = '') {
        this.baseURL = baseURL;
        this.activeRequests = new Set(); // Tracks requests to prevent duplicates
    }

    // Helper to simulate network latency and random failures
    _simulateNetwork() {
        return new Promise((resolve, reject) => {
            const latency = Math.floor(Math.random() * 600) + 200; // 200ms - 800ms delay
            
            setTimeout(() => {
                // 5% chance of random server failure to test error handling
                if (Math.random() < 0.05) {
                    reject(new APIError('Simulated Network Failure (500 Internal Server Error)', 500));
                } else {
                    resolve();
                }
            }, latency);
        });
    }

    // The core request handler
    async request(endpoint, { method = 'GET', body = null, timeoutMs = 5000, headers = {} } = {}) {
        // Prevent duplicate requests to the exact same endpoint while one is pending
        const requestKey = `${method}:${endpoint}`;
        if (this.activeRequests.has(requestKey)) {
            throw new APIError('Duplicate request prevented. Please wait.', 429);
        }
        this.activeRequests.add(requestKey);

        // AbortController for timeouts (Requirement 4.3)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        try {
            // 1. Wait for our simulated network delay/failure first
            await this._simulateNetwork();

            //  FAKE BACKEND LOGIC
            // Since we don't have a real server, POST/PUT/DELETE requests to local files 
            // will naturally fail. We intercept them here and fake a successful server response
            if (method !== 'GET') {
                return { success: true, data: body, message: `Simulated ${method} success` };
            }

            // 3. REAL REQUEST LOGIC (For GET requests like fetching users/tasks)
            const options = {
                method,
                signal: controller.signal, 
                headers: {
                    'Content-Type': 'application/json',
                    ...headers
                }
            };

            if (body) {
                options.body = JSON.stringify(body);
            }

            const response = await fetch(`${this.baseURL}${endpoint}`, options);

            if (!response.ok) {
                throw new APIError(`HTTP Error: ${response.statusText}`, response.status);
            }

            return await response.json();

        } catch (error) {
            // Check if the error was caused by our timeout abort
            if (error.name === 'AbortError') {
                throw new APIError('Request timed out after 5 seconds', 408);
            }
            // Re-throw our custom API errors
            if (error instanceof APIError) {
                throw error;
            }
            // Catch anything else
            throw new APIError(error.message || 'Unknown Network Error', 500);
            
        } finally {
            // Cleanup: clear the timeout and remove the lock so the user can request again
            clearTimeout(timeoutId);
            this.activeRequests.delete(requestKey);
        }
    }

    // --- Helper Methods ---
    get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    }

    post(endpoint, body, options = {}) {
        return this.request(endpoint, { ...options, method: 'POST', body });
    }

    put(endpoint, body, options = {}) {
        return this.request(endpoint, { ...options, method: 'PUT', body });
    }

    delete(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    }
}

export const apiClient = new ApiClient();


export async function fetchInitialTasks() {
    try {
        return await apiClient.get('./data/tasks.json');
    } catch (error) {
        console.error('Failed to load initial tasks:', error.message);
        return []; 
    }
}