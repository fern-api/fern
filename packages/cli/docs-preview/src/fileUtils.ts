import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { Logger } from "@fern-api/logger";
import { mkdir, writeFile } from "fs/promises";
import { DEPLOYMENTS_PATH } from "./incrementalSync";

// Helper function to create SHA256 hash of file contents
export async function computeFileHash(filePath: AbsoluteFilePath): Promise<string> {
    const crypto = await import("crypto");
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash("sha256");
        const fs = require("fs");
        const stream = fs.createReadStream(filePath);

        stream.on("data", (data: Buffer) => hash.update(data as any));
        stream.on("end", () => resolve(hash.digest("hex")));
        stream.on("error", reject);
    });
}

// Download individual file from the raw bundle system
export async function downloadFile(
    bucketUrl: string,
    version: string,
    relativePath: string,
    destinationPath: AbsoluteFilePath,
    logger: Logger
): Promise<void> {
    const fileUrl = new URL(`${DEPLOYMENTS_PATH}/${version}/${relativePath}`, bucketUrl).href;
    logger.debug(`Downloading ${relativePath} from ${fileUrl}`);

    const response = await fetch(fileUrl);
    if (!response.ok) {
        throw new Error(`Failed to download file ${relativePath}. Status: ${response.status}`);
    }

    if (response.body == null) {
        throw new Error(`File ${relativePath} has empty response body`);
    }

    // Ensure parent directory exists
    const path = await import("path");
    const parentDir = AbsoluteFilePath.of(path.dirname(destinationPath));
    await mkdir(parentDir, { recursive: true });

    const buffer = Buffer.from(await response.arrayBuffer());
    await writeFile(destinationPath, buffer as any);
}
