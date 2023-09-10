import { RelativeFilePath } from "@fern-api/fs-utils";
import { NodePath } from "@fern-api/yaml-schema";

export interface ValidationViolation {
    severity: "error" | "warning";
    relativeFilepath: RelativeFilePath;
    nodePath: NodePath;
    message: string;
}
