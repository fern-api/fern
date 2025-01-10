import { NodePath } from "@fern-api/fern-definition-schema";
import { RelativeFilePath } from "@fern-api/fs-utils";

export interface ValidationViolation {
    name?: string;
    severity: "fatal" | "error" | "warning";
    relativeFilepath: RelativeFilePath;
    nodePath: NodePath;
    message: string;
}
