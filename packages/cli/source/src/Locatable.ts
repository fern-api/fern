import type { SourceLocation } from "./SourceLocation";

/**
 * A value with source location tracking.
 */
export interface Locatable {
    readonly $loc: SourceLocation;
}
