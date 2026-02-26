import { AxiosInstance } from 'axios';
import { ZodSchema } from 'zod';
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
export declare abstract class SovereignAdapter<T = TruthData, P extends Record<string, any> = any> implements DataSource<T> {
    readonly id: string;
    readonly name: string;
    readonly category: DataCategory;
    readonly schema?: ZodSchema<T>;
    readonly capabilities: SourceCapabilities;
    protected config: AdapterConfig;
    protected client: AxiosInstance;
    constructor(config: AdapterConfig);
    /**
     * fetch implementation
     * Surrogates networking to protected fetchData/getMockData
     */
    fetch(request: DataRequest): Promise<DataResponse<T>>;
    protected abstract fetchData(params: P): Promise<T>;
    protected abstract getMockData(params: P): Promise<T>;
    /**
     * Helper to retrieve secrets from config.
     * In production, this can be overridden to pull from a KMS or Vault.
     */
    protected getSecret(name: string): Promise<string | undefined>;
    dispose(): Promise<void>;
}
