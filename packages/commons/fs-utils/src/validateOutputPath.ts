import os from "os";
import path from "path";
import { AbsoluteFilePath } from "./AbsoluteFilePath";

export interface PathValidationResult {
    isValid: boolean;
    reason?: string;
}

const DANGEROUS_PATHS = [
    "/",
    "/bin",
    "/boot",
    "/dev",
    "/etc",
    "/lib",
    "/lib64",
    "/proc",
    "/root",
    "/sbin",
    "/sys",
    "/usr",
    "/var",
    "/opt",
    "/mnt",
    "/media",
    "/srv",
    "/tmp",
    "/run",
    "C:\\",
    "C:\\Windows",
    "C:\\Program Files",
    "C:\\Program Files (x86)",
    "C:\\Users",
    "C:\\ProgramData"
];

/**
 * Validates that an output path is safe to write to.
 * This prevents directory traversal attacks and protects system directories.
 *
 * @param outputPath - The absolute path to validate
 * @returns PathValidationResult indicating if the path is safe
 */
export function validateOutputPath(outputPath: AbsoluteFilePath): PathValidationResult {
    if (outputPath.includes("..")) {
        return {
            isValid: false,
            reason: "Path contains directory traversal sequences (..)"
        };
    }

    const normalizedPath = path.normalize(outputPath);

    for (const dangerousPath of DANGEROUS_PATHS) {
        const normalizedDangerousPath = path.normalize(dangerousPath);

        if (normalizedPath === normalizedDangerousPath) {
            return {
                isValid: false,
                reason: `Cannot write to system directory: ${dangerousPath}`
            };
        }

        if (normalizedPath.startsWith(normalizedDangerousPath + path.sep)) {
            const relativePart = normalizedPath.substring(normalizedDangerousPath.length + 1);
            if (!relativePart || relativePart.split(path.sep).length < 2) {
                return {
                    isValid: false,
                    reason: `Cannot write to system directory: ${dangerousPath}`
                };
            }
        }
    }

    const homeDir = os.homedir();
    if (normalizedPath === homeDir) {
        return {
            isValid: false,
            reason: "Cannot write directly to home directory root"
        };
    }

    if (normalizedPath === "/home" || normalizedPath === "/Users") {
        return {
            isValid: false,
            reason: "Cannot write directly to /home or /Users root directory"
        };
    }

    const parsedPath = path.parse(normalizedPath);
    if (parsedPath.dir === parsedPath.root && parsedPath.base === "") {
        return {
            isValid: false,
            reason: "Cannot write to filesystem root"
        };
    }

    return { isValid: true };
}

/**
 * Checks if a path is within a project directory (contains fern/ or .git/)
 * This is a heuristic to determine if we're in a safe project context.
 *
 * @param outputPath - The absolute path to check
 * @returns true if the path appears to be within a project directory
 */
export function isWithinProjectDirectory(outputPath: AbsoluteFilePath): boolean {
    const normalizedPath = path.normalize(outputPath);
    const parts = normalizedPath.split(path.sep);

    for (let i = parts.length - 1; i >= 0; i--) {
        const currentPath = parts.slice(0, i + 1).join(path.sep);

        const markers = ["fern", ".git", "node_modules", "package.json", ".fern"];
        for (const marker of markers) {
            const markerPath = path.join(currentPath, marker);
            if (
                normalizedPath.includes(path.join(path.sep, marker, path.sep)) ||
                normalizedPath.endsWith(path.join(path.sep, marker))
            ) {
                return true;
            }
        }
    }

    return false;
}
