/**
 * Data Point - v3.0 Foundation
 *
 * Wraps adapter data with rich metadata for lineage tracking,
 * quality metrics, and SLA monitoring.
 */
/**
 * Complete data point with value and metadata
 */
export interface TruthPoint<T> {
    /** The actual data value */
    value: T;
    /** Rich metadata about data provenance and quality */
    metadata: DataMetadata;
}
/**
 * Metadata attached to every data point
 */
export interface DataMetadata {
    /** Data source identifier (e.g., 'binance.spot.btcusdt') */
    source: string;
    /** When the data was fetched (Unix timestamp in ms) */
    timestamp: number;
    /** Unique request identifier for tracing */
    requestId: string;
    /** Data lineage - where this data came from */
    lineage: DataLineage;
    /** Quality metrics for this data point */
    quality: QualityMetrics;
    /** SLA compliance information (optional) */
    sla?: SLAMetrics;
    /** V4 DON Architecture: The pure Keccak256 hash of the normalized payload */
    verifiableHash?: string;
    /** Allow any additional metadata fields (tags, snippets, geo, etc.) */
    [key: string]: any;
}
/**
 * Tracks the complete lineage of a data point
 */
export interface DataLineage {
    /** Adapter that produced this data */
    adapter: string;
    /** When the data was fetched from source */
    fetchedAt: number;
    /** When the data was cached (if applicable) */
    cachedAt?: number;
    /** Cache hit or miss */
    cacheHit: boolean;
    /** Transformations applied to the data */
    transformedBy?: string[];
    /** Number of retry attempts before success */
    retryAttempts?: number;
    /** Whether circuit breaker was involved */
    circuitBreakerState?: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
}
/**
 * Quality metrics for data validation
 */
export interface QualityMetrics {
    /** Confidence score (0-1) */
    confidence: number;
    /** Data freshness in milliseconds */
    freshness: number;
    /** Whether data passed schema validation */
    validated: boolean;
    /** Number of data points in aggregate (if applicable) */
    sampleSize?: number;
    /** Standard deviation (for aggregated data) */
    variance?: number;
}
/**
 * SLA compliance metrics (optional)
 */
export interface SLAMetrics {
    /** Whether SLA was met */
    met: boolean;
    /** Request latency in milliseconds */
    latency: number;
    /** Current availability percentage */
    availability: number;
    /** Freshness requirement met */
    freshnessRequirementMet: boolean;
}
