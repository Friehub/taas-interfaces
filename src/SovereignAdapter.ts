import axios, { AxiosInstance } from 'axios';
import { ZodSchema } from 'zod';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { DataResponse, DataSource, DataCategory, DataRequest, SourceCapabilities } from './DataSource.js';
import { TruthData } from './TruthData.js';

export interface AdapterConfig {
    id?: string;
    apiKey?: string;
    rateLimitRequestPerMinute?: number;
    useMocks?: boolean;
    name: string;
    category: DataCategory;
    responseSchema?: ZodSchema<any>;
    proxy?: string;
    clientConfig?: Record<string, any>;
}

/**
 * SovereignAdapter: The lean, stateless base for all TaaS Truth Sources.
 * Focuses exclusively on data resolution, offloading ALL infrastructure
 * (Rate Limiting, Retries, Caching, Circuit Breaking) to the Host/Gateway.
 */
export abstract class SovereignAdapter<T = TruthData, P extends Record<string, any> = any> implements DataSource<T> {
    readonly id: string;
    readonly name: string;
    readonly category: DataCategory;
    readonly schema?: ZodSchema<T>;
    readonly capabilities: SourceCapabilities;

    protected config: AdapterConfig;
    protected client: AxiosInstance;

    constructor(config: AdapterConfig) {
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

        const axiosConfig: any = {
            timeout: 30000,
            ...config.clientConfig
        };
        if (config.proxy) {
            axiosConfig.httpsAgent = new HttpsProxyAgent(config.proxy);
            axiosConfig.proxy = false;
        }

        this.client = axios.create(axiosConfig);
    }

    /**
     * fetch implementation
     * Surrogates networking to protected fetchData/getMockData
     */
    public async fetch(request: DataRequest): Promise<DataResponse<T>> {
        const value = (this.config.useMocks || process.env.USE_MOCKS === 'true')
            ? await this.getMockData(request.params as P)
            : await this.fetchData(request.params as P);

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

    protected abstract fetchData(params: P): Promise<T>;
    protected abstract getMockData(params: P): Promise<T>;

    /**
     * Helper to retrieve secrets from config.
     * In production, this can be overridden to pull from a KMS or Vault.
     */
    protected async getSecret(name: string): Promise<string | undefined> {
        // Default implementation checks the apiKey or a mapping in config
        if (name.includes('API_KEY')) return this.config.apiKey;
        return undefined;
    }

    public async dispose(): Promise<void> { }
}
