import { RelativeFilePath } from "@fern-api/config-management-commons";
import { NodePath } from "@fern-api/yaml-schema";

export interface ValidationViolation {
    severity: "error" | "warning";
    relativeFilePath: RelativeFilePath;
    nodePath: NodePath;
    message: string;
}
