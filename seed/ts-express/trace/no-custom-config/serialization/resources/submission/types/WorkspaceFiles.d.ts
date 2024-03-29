/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as serializers from "../../..";
import * as SeedTrace from "../../../../api";
import * as core from "../../../../core";
export declare const WorkspaceFiles: core.serialization.ObjectSchema<serializers.WorkspaceFiles.Raw, SeedTrace.WorkspaceFiles>;
export declare namespace WorkspaceFiles {
    interface Raw {
        mainFile: serializers.FileInfo.Raw;
        readOnlyFiles: serializers.FileInfo.Raw[];
    }
}
