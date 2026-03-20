import type { SourceLocation } from "@fern-api/source";
import type { Target } from "./Target.js";

/**
 * SDK generation configuration derived from fern.yml.
 */
export interface SdkConfig {
    /** The organization name */
    org: string;
    /** The default group to generate, if any */
    defaultGroup?: string;
    /** Source location of the defaultGroup field in fern.yml */
    defaultGroupLocation?: SourceLocation;
    /** SDK targets to generate */
    targets: Target[];
}
