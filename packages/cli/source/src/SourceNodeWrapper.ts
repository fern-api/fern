import type { Sourced } from "./Sourced.js";

/**
 * A function that wraps a child node value with source tracking.
 */
export type SourceNodeWrapper = <T>(value: T, key: string | number) => Sourced<T>;
