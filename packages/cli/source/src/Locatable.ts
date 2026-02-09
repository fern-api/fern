import type { SourceLocation } from "./SourceLocation.js";

/**
 * A value with source location tracking.
 */
export interface Locatable {
    readonly $loc: SourceLocation;
}
