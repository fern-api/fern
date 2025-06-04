import fs from "fs/promises";
import path from "path";
import { Project } from "ts-morph";

import { AbsoluteFilePath } from "@fern-api/fs-utils";

const filePathOnDockerContainer = AbsoluteFilePath.of("/assets/asIs");
/**
 * A map containing the original source path and the target path in the generated project
 */
const asIsFiles = {
    core: {
        mergeHeaders: { "core/mergeHeaders.ts": "src/core/mergeHeaders.ts" },
        json: {
            vanilla: { "core/json.vanilla.ts": "src/core/json.ts" },
            bigint: { "core/json.bigint.ts": "src/core/json.ts" }
        }
    }
} as const;

export namespace AsIsManager {
    export interface Init {
        useBigInt: boolean;
    }
}

export class AsIsManager {
    private useBigInt: boolean;
    /**
     *
     */
    constructor({ useBigInt }: AsIsManager.Init) {
        this.useBigInt = useBigInt;
    }

    public async AddToTsProject({ project }: { project: Project }): Promise<void> {
        const filesToCopy: Record<string, string>[] = [];

        filesToCopy.push(this.useBigInt ? asIsFiles.core.json.bigint : asIsFiles.core.json.vanilla);
        filesToCopy.push(asIsFiles.core.mergeHeaders);
        
        for (const [sourceFilePath, targetFilePath] of filesToCopy.flatMap(Object.entries)) {
            const fileContent = await fs.readFile(path.join(filePathOnDockerContainer, sourceFilePath), "utf-8");
            project.createSourceFile(targetFilePath, fileContent, { overwrite: true });
        }
    }
}
