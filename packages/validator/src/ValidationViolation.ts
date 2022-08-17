import { RelativeFilePath } from "@fern-api/core-utils";
import { NodePath } from "@fern-api/yaml-schema";

export interface ValidationViolation {
    severity: "error" | "warning";
    relativeFilePath: RelativeFilePath;
    nodePath: NodePath;
    message: string;
}
