import { z } from 'zod';
import { TruthData } from './TruthData.js';
/**
 * Universal interface for all data sources
 * Every adapter implements this interface - no exceptions
 */
export interface DataSource<T = TruthData> {
    /** Unique identifier for the data source (e.g., "binance", "coingecko") */
    readonly id: string;
    /** Human-readable name (e.g., "Binance") */
    readonly name: string;
    /** Category of data this source provides */
    readonly category: DataCategory;
    /** Optional schema for normalizing output (v3.0) */
    readonly schema?: z.ZodSchema<T>;
    /** Capabilities declaration */
    readonly capabilities: SourceCapabilities;
    /**
     * Fetch data from this source
     * @param request - Data request with params and optional timestamp
     * @returns Data response with metadata
     */
    fetch(request: DataRequest): Promise<DataResponse<T>>;
    /**
     * Fetch multiple data points in batch (optional)
     * Implement if the underlying API supports batch requests
     */
    fetchBatch?(requests: DataRequest[]): Promise<DataResponse<T>[]>;
    /**
     * Initialize the data source (optional)
     * Called once when source is registered
     */
    initialize?(): Promise<void>;
    /**
     * Clean up resources (optional)
     * Called when source is unregistered or app shuts down
     */
    dispose?(): Promise<void>;
}
/**
 * Capabilities that a data source can declare
 */
export interface SourceCapabilities {
    /** Can fetch historical data via timestamp parameter */
    supportsHistorical: boolean;
    /** Can provide real-time/live data */
    supportsRealtime: boolean;
    /** Supports batch requests */
    supportsBatch: boolean;
    /** Maximum historical data lookback in days (if supportsHistorical=true) */
    maxHistoricalDays?: number;
    /** Rate limit in requests per minute */
    rateLimitPerMinute?: number;
    /** Requires API key */
    requiresAuth?: boolean;
}
/**
 * Request for data from a source
 */
export interface DataRequest {
    /** Adapter-specific parameters (e.g., { symbol: "BTC" }) */
    params: Record<string, any>;
    /**
     * Timestamp (Unix milliseconds) for historical data
     * If undefined, fetch current/latest data
     */
    timestamp?: number;
    /** Request timeout in milliseconds */
    timeout?: number;
    /** Context from truth attestation (for state management) */
    attestationContext?: AttestationContext;
}
/**
 * Response from a data source
 */
export interface DataResponse<T> {
    /** The actual data */
    data: T;
    /** Metadata about the fetch */
    metadata: ResponseMetadata;
}
/**
 * Metadata attached to every data response
 */
export interface ResponseMetadata {
    /** ID of the source that provided this data */
    source: string;
    /** Timestamp when this data was valid (Unix milliseconds) */
    timestamp: number;
    /** Timestamp when this data was fetched (Unix milliseconds) */
    fetchedAt: number;
    /** Whether this response came from cache */
    cacheHit: boolean;
    /** Request latency in milliseconds */
    latency: number;
    /** Optional: retry attempt number */
    retryAttempt?: number;
    /** Cryptographic hash of the normalized payload for DON consensus */
    verifiableHash?: string;
    /** Optional: additional source-specific metadata */
    extra?: Record<string, any>;
}
/**
 * Context for truth attestation
 * Ensures timestamp consistency across retries
 */
export interface AttestationContext {
    /** Request identifier */
    requestId: string;
    /**
     * Fixed timestamp for this attestation (Unix milliseconds)
     * All data fetches should use this timestamp for historical data
     */
    attestationTimestamp: number;
    /** Request deadline (Unix seconds) */
    deadline: number;
    /** Resolution attempt number (starts at 0) */
    attempt: number;
    /** Errors from previous attempts (if retrying) */
    previousErrors?: any[];
}
/**
 * Categories of data sources
 */
export declare enum DataCategory {
    CRYPTO = "crypto",
    SPORTS = "sports",
    WEATHER = "weather",
    ECONOMICS = "economics",
    FINANCE = "finance",
    FOREX = "forex",
    ONCHAIN = "onchain",
    SOCIAL = "social",
    PREDICTION = "prediction",
    NEWS = "news",
    CUSTOM = "custom"
}
