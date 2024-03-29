/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../..";
import * as SeedTrace from "../../../../api";
import * as core from "../../../../core";

export const MigrationStatus: core.serialization.Schema<serializers.MigrationStatus.Raw, SeedTrace.MigrationStatus> =
    core.serialization.enum_(["RUNNING", "FAILED", "FINISHED"]);

export declare namespace MigrationStatus {
    type Raw = "RUNNING" | "FAILED" | "FINISHED";
}
