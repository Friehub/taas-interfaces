import { TruthData } from './TruthData.js';
import { SovereignAdapter, AdapterConfig } from './SovereignAdapter.js';
export interface RestEndpointConfig {
    path: string;
    method?: 'GET' | 'POST';
    dataPath?: string;
}
export interface SchemaAdapterConfig extends AdapterConfig {
    baseUrl: string;
    endpoints: Record<string, RestEndpointConfig>;
}
/**
 * GenericRestAdapter: A standardized base for REST-based TaaS plugins.
 * Handles path interpolation and data path resolution.
 */
export declare class GenericRestAdapter extends SovereignAdapter<TruthData> {
    private adapterConfig;
    constructor(adapterConfig: SchemaAdapterConfig);
    protected fetchData(params: {
        endpoint: string;
        id?: string;
    } & Record<string, any>): Promise<any>;
    protected getMockData(params: {
        endpoint: string;
    } & Record<string, any>): Promise<any>;
}
