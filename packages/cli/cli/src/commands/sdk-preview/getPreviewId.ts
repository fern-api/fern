import { execSync } from "child_process";
import { randomBytes } from "crypto";

const MAX_PREVIEW_ID_LENGTH = 40;

export function getPreviewId(): string {
    try {
        const branch = execSync("git rev-parse --abbrev-ref HEAD", {
            encoding: "utf-8",
            stdio: ["pipe", "pipe", "pipe"]
        }).trim();

        if (branch === "HEAD" || branch === "") {
            return generateRandomId();
        }

        return sanitizeBranchName(branch);
    } catch {
        return generateRandomId();
    }
}

export function sanitizeBranchName(branch: string): string {
    return branch
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, MAX_PREVIEW_ID_LENGTH);
}

function generateRandomId(): string {
    return randomBytes(4).toString("hex");
}
