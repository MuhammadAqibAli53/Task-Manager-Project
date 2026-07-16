
class ApiClient {
    constructor(baseURL = '') {
        this.baseURL = baseURL;
    }

    async request(endpoint, { method = 'GET', body = null, headers = {} } = {}) {
        try {
            const options = {
                method,
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
    
            throw error;
    
        }
    }

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

export class APIError extends Error {
    constructor(message, status = 500, data = null) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.data = data;
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