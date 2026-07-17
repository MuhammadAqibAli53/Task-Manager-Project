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
    }


    async request(endpoint, options = {}) {
  
        const method = options.method;
        const body = options.body;
        const headers = options.headers;

    
        try {
   
            const opt = {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    ...headers
                }
            };

   
            if (body) {
                opt.body = JSON.stringify(body);
            }

            const response = await fetch(`${this.baseURL}${endpoint}`, opt);

            if (!response.ok) {
                throw new APIError(`HTTP Error: ${response.statusText}`, response.status);
            }

            return await response.json();

        } catch (error) {
            throw error;
        }
    }

    
    get(endpoint, options = {}) {
        options.method = 'GET';
        return this.request(endpoint, options);
    }

    post(endpoint, body, options = {}) {
        options.method = 'POST';
        options.body = body;
        return this.request(endpoint, options);
    }

    put(endpoint, body, options = {}) {
        options.method = 'PUT';
        options.body = body;
        return this.request(endpoint, options);
    }

    delete(endpoint, options = {}) {
        options.method = 'DELETE';
        return this.request(endpoint, options);
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