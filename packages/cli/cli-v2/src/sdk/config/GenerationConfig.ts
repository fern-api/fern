import type { Target } from "./Target";

/**
 * SDK generation configuration derived from fern.yml.
 */
export interface GenerationConfig {
    /** The organization name */
    org: string;
    /** The default group to generate, if any */
    defaultGroup?: string;
    /** SDK targets to generate */
    targets: Target[];
}
