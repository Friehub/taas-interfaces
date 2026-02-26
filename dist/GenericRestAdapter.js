"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenericRestAdapter = void 0;
const SovereignAdapter_js_1 = require("./SovereignAdapter.js");
/**
 * GenericRestAdapter: A standardized base for REST-based TaaS plugins.
 * Handles path interpolation and data path resolution.
 */
class GenericRestAdapter extends SovereignAdapter_js_1.SovereignAdapter {
    adapterConfig;
    constructor(adapterConfig) {
        super(adapterConfig);
        this.adapterConfig = adapterConfig;
    }
    async fetchData(params) {
        const endpointConfig = this.adapterConfig.endpoints[params.endpoint];
        if (!endpointConfig) {
            throw new Error(`Endpoint '${params.endpoint}' not defined in schema for ${this.name}`);
        }
        // Interpolate path (e.g., /ticker/${symbol} -> /ticker/BTC)
        let path = endpointConfig.path;
        for (const [key, value] of Object.entries(params)) {
            path = path.replace(`\${${key}}`, String(value));
        }
        const url = `${this.adapterConfig.baseUrl}${path}`;
        const method = endpointConfig.method || 'GET';
        const res = await this.client.request({
            url,
            method,
            params: method === 'GET' ? params : undefined,
            data: method === 'POST' ? params : undefined
        });
        let rawData = res.data;
        // Resolve dataPath if provided
        if (endpointConfig.dataPath) {
            const parts = endpointConfig.dataPath.split('.');
            for (const part of parts) {
                if (rawData === undefined || rawData === null)
                    break;
                rawData = rawData[part];
            }
        }
        // Return unified TruthData
        return {
            id: params.id || params.symbol || params.endpoint,
            value: rawData,
            category: this.category || 'universal',
            source: this.id,
            timestamp: Math.floor(Date.now() / 1000),
            metadata: {
                endpoint: params.endpoint,
                rawData: typeof rawData === 'object' ? rawData : undefined
            }
        };
    }
    async getMockData(params) {
        return {
            mocked: true,
            endpoint: params.endpoint,
            timestamp: Date.now()
        };
    }
}
exports.GenericRestAdapter = GenericRestAdapter;
