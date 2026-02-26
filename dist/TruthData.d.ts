/**
 * Standardized data format for all TaaS Truth Sources.
 * Ensures that disparate APIs (Sports, Crypto, Weather) return
 * a consistent payload for the consensus engine.
 */
export interface TruthData {
    /** Unique identifier for this specific data point */
    id: string;
    /** The actual value (number, string, or boolean) */
    value: any;
    /** Category for routing and validation */
    category: string;
    /** Identifier of the source that produced this data */
    source: string;
    /** Unix timestamp (seconds) when the data was valid */
    timestamp: number;
    /** Optional metadata (raw response, confidence scores, etc.) */
    metadata?: Record<string, any>;
}
