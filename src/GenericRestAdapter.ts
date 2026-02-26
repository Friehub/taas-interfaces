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
export class GenericRestAdapter extends SovereignAdapter<TruthData> {
    private adapterConfig: SchemaAdapterConfig;

    constructor(adapterConfig: SchemaAdapterConfig) {
        super(adapterConfig);
        this.adapterConfig = adapterConfig;
    }

    protected async fetchData(params: { endpoint: string, id?: string } & Record<string, any>): Promise<any> {
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
                if (rawData === undefined || rawData === null) break;
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

    protected async getMockData(params: { endpoint: string } & Record<string, any>): Promise<any> {
        return {
            mocked: true,
            endpoint: params.endpoint,
            timestamp: Date.now()
        };
    }
}
