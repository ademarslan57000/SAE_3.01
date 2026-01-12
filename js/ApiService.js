/**
 * Service API centralisé
 * Principe SOLID : Single Responsibility + Dependency Inversion
 * Gestion centralisée de tous les appels API
 */
class ApiService {
    constructor(baseUrl = '') {
        this.baseUrl = baseUrl;
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Requête GET avec gestion du cache
     */
    async get(endpoint, options = {}) {
        const cacheKey = `${endpoint}${JSON.stringify(options)}`;
        
        // Vérifier le cache
        if (options.useCache !== false) {
            const cached = this.getFromCache(cacheKey);
            if (cached) {
                return cached;
            }
        }

        try {
            const url = this.buildUrl(endpoint, options.params);
            const response = await fetch(url, {
                method: 'GET',
                headers: this.getHeaders(options.headers),
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Mettre en cache si demandé
            if (options.useCache !== false) {
                this.setCache(cacheKey, data);
            }

            return data;
        } catch (error) {
            console.error('API GET Error:', error);
            throw error;
        }
    }

    /**
     * Requête POST
     */
    async post(endpoint, body, options = {}) {
        try {
            const url = this.buildUrl(endpoint);
            const response = await fetch(url, {
                method: 'POST',
                headers: this.getHeaders(options.headers),
                body: JSON.stringify(body),
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API POST Error:', error);
            throw error;
        }
    }

    /**
     * Requête PUT
     */
    async put(endpoint, body, options = {}) {
        try {
            const url = this.buildUrl(endpoint);
            const response = await fetch(url, {
                method: 'PUT',
                headers: this.getHeaders(options.headers),
                body: JSON.stringify(body),
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API PUT Error:', error);
            throw error;
        }
    }

    /**
     * Requête DELETE
     */
    async delete(endpoint, options = {}) {
        try {
            const url = this.buildUrl(endpoint);
            const response = await fetch(url, {
                method: 'DELETE',
                headers: this.getHeaders(options.headers),
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API DELETE Error:', error);
            throw error;
        }
    }

    /**
     * Construire l'URL complète
     */
    buildUrl(endpoint, params = null) {
        let url = `${this.baseUrl}${endpoint}`;
        
        if (params) {
            const queryString = new URLSearchParams(params).toString();
            url += `?${queryString}`;
        }
        
        return url;
    }

    /**
     * Obtenir les headers par défaut
     */
    getHeaders(customHeaders = {}) {
        return {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...customHeaders
        };
    }

    /**
     * Obtenir depuis le cache
     */
    getFromCache(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;

        const now = Date.now();
        if (now - cached.timestamp > this.cacheTimeout) {
            this.cache.delete(key);
            return null;
        }

        return cached.data;
    }

    /**
     * Mettre en cache
     */
    setCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    /**
     * Vider le cache
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Requêtes parallèles
     */
    async fetchMultiple(requests) {
        try {
            const promises = requests.map(req => {
                if (req.method === 'GET') {
                    return this.get(req.endpoint, req.options);
                } else if (req.method === 'POST') {
                    return this.post(req.endpoint, req.body, req.options);
                }
                // Ajouter d'autres méthodes si nécessaire
            });

            return await Promise.all(promises);
        } catch (error) {
            console.error('Multiple requests error:', error);
            throw error;
        }
    }
}

// Instance singleton
const apiService = new ApiService();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ApiService;
}
