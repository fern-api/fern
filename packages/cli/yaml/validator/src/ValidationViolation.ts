import { RelativeFilePath } from "@fern-api/core-utils";
import { NodePath } from "@fern-api/yaml-schema";

export interface ValidationViolation {
    severity: "error" | "warning";
    relativeFilepath: RelativeFilePath;
    nodePath: NodePath;
    message: string;
}
