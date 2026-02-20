/**
 * A record of key-value pairs that can be used to tag telemetry events.
 *
 * Note that we only allow single-level keys and values to prevent high cardinality metrics.
 * For details, see https://chronosphere.io/learn/what-is-high-cardinality
 */
export type Tags = Record<string, string | number | boolean | null>;
