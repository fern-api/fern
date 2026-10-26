import { ValidationViolation } from "@fern-api/fern-definition-validator";
import { RelativeFilePath } from "@fern-api/fs-utils";

export const MIN_SUPPORTED_NODE_MAJOR = 20;
export const MAX_SUPPORTED_NODE_MAJOR = 24;

const NODE_VERSION_RULE_NAME = "supported-node-version";

export interface SystemValidationResult {
    violations: ValidationViolation[];
}

export function checkNodeVersion(nodeVersion: string = process.versions.node): SystemValidationResult {
    const major = Number.parseInt(nodeVersion.split(".")[0] ?? "", 10);
    const supportedRange = `${MIN_SUPPORTED_NODE_MAJOR}.x-${MAX_SUPPORTED_NODE_MAJOR}.x`;

    let reason: string | undefined;
    if (Number.isNaN(major)) {
        reason = `Could not determine the Node.js version (got "${nodeVersion}").`;
    } else if (major < MIN_SUPPORTED_NODE_MAJOR) {
        reason = `Node.js v${nodeVersion} is not supported by the Fern CLI (requires ${supportedRange}).`;
    } else if (major > MAX_SUPPORTED_NODE_MAJOR) {
        reason = `Node.js v${nodeVersion} has not been verified with the Fern CLI (supported: ${supportedRange}) and can cause commands to hang or exit early.`;
    }

    if (reason == null) {
        return { violations: [] };
    }
    return {
        violations: [
            {
                name: NODE_VERSION_RULE_NAME,
                severity: "error",
                relativeFilepath: RelativeFilePath.of(""),
                nodePath: [],
                message: `${reason} Install Node.js ${MAX_SUPPORTED_NODE_MAJOR} (e.g. \`nvm install ${MAX_SUPPORTED_NODE_MAJOR}\`) and re-run.`
            }
        ]
    };
}
