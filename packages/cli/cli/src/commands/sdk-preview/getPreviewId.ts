import { exec } from "child_process";
import { randomBytes } from "crypto";
import { promisify } from "util";

const execAsync = promisify(exec);

const MAX_PREVIEW_ID_LENGTH = 40;

export async function getPreviewId(): Promise<string> {
    try {
        const { stdout } = await execAsync("git rev-parse --abbrev-ref HEAD");
        const branch = stdout.trim();

        if (branch === "HEAD" || branch === "") {
            return generateRandomId();
        }

        const sanitized = sanitizeBranchName(branch);
        if (sanitized === "") {
            return generateRandomId();
        }

        return sanitized;
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
        .slice(0, MAX_PREVIEW_ID_LENGTH)
        .replace(/-$/, "");
}

function generateRandomId(): string {
    return randomBytes(4).toString("hex");
}
