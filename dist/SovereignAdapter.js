"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SovereignAdapter = void 0;
const axios_1 = __importDefault(require("axios"));
const https_proxy_agent_1 = require("https-proxy-agent");
/**
 * SovereignAdapter: The lean, stateless base for all TaaS Truth Sources.
 * Focuses exclusively on data resolution, offloading ALL infrastructure
 * (Rate Limiting, Retries, Caching, Circuit Breaking) to the Host/Gateway.
 */
class SovereignAdapter {
    id;
    name;
    category;
    schema;
    capabilities;
    config;
    client;
    constructor(config) {
        this.config = config;
        this.id = config.id || config.name.toLowerCase().replace(/\s+/g, '_');
        this.name = config.name;
        this.category = config.category;
        this.schema = config.responseSchema;
        // Define capabilities
        this.capabilities = {
            supportsHistorical: false,
            supportsRealtime: true,
            supportsBatch: false,
            requiresAuth: !!config.apiKey
        };
        const axiosConfig = {
            timeout: 30000,
            ...config.clientConfig
        };
        if (config.proxy) {
            axiosConfig.httpsAgent = new https_proxy_agent_1.HttpsProxyAgent(config.proxy);
            axiosConfig.proxy = false;
        }
        this.client = axios_1.default.create(axiosConfig);
    }
    /**
     * fetch implementation
     * Surrogates networking to protected fetchData/getMockData
     */
    async fetch(request) {
        const value = (this.config.useMocks || process.env.USE_MOCKS === 'true')
            ? await this.getMockData(request.params)
            : await this.fetchData(request.params);
        const timestamp = request.attestationContext?.attestationTimestamp || Date.now();
        return {
            data: value,
            metadata: {
                source: this.id,
                timestamp: timestamp,
                fetchedAt: Date.now(),
                cacheHit: false,
                latency: 0,
            }
        };
    }
    /**
     * Helper to retrieve secrets from config.
     * In production, this can be overridden to pull from a KMS or Vault.
     */
    async getSecret(name) {
        // Default implementation checks the apiKey or a mapping in config
        if (name.includes('API_KEY'))
            return this.config.apiKey;
        return undefined;
    }
    async dispose() { }
}
exports.SovereignAdapter = SovereignAdapter;
