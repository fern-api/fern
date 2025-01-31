import { RelativeFilePath } from "@fern-api/fs-utils";
import { NodePath } from "./NodePath";

export interface ValidationViolation {
    name: string;
    severity: "fatal" | "error" | "warning";
    relativeFilepath: RelativeFilePath;
    nodePath: NodePath;
    message: string;
}
