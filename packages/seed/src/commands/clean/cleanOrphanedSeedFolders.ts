import { APIS_DIRECTORY, FERN_DIRECTORY } from "@fern-api/configuration";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { CONSOLE_LOGGER } from "@fern-api/logger";
import fs from "fs";
import { rm } from "fs/promises";
import path from "path";

import { GeneratorWorkspace } from "../../loadGeneratorWorkspaces";
import { LANGUAGE_SPECIFIC_FIXTURE_PREFIXES } from "../test/testWorkspaceFixtures";

export interface OrphanedFolder {
    generator: string;
    folder: string;
    subFolder?: string;
    absolutePath: AbsoluteFilePath;
}

export interface CleanResult {
    orphanedFolders: OrphanedFolder[];
    deletedFolders: OrphanedFolder[];
}

function getTestDefinitions(): Set<string> {
    const testDefinitionsPath = path.join(__dirname, "../../../test-definitions", FERN_DIRECTORY, APIS_DIRECTORY);
    const files = fs.readdirSync(testDefinitionsPath);
    const directories = files
        .map((file) => path.join(testDefinitionsPath, file))
        .filter((fullPath) => fs.statSync(fullPath).isDirectory())
        .map((fullPath) => path.basename(fullPath));
    return new Set(directories);
}

function getExpectedFixtures(generator: GeneratorWorkspace, testDefinitions: Set<string>): Set<string> {
    const expectedFixtures = new Set<string>();

    for (const testDef of testDefinitions) {
        const matchingPrefix = LANGUAGE_SPECIFIC_FIXTURE_PREFIXES.find((prefix) => testDef.startsWith(prefix));
        if (matchingPrefix != null && !generator.workspaceName.startsWith(matchingPrefix)) {
            continue;
        }
        expectedFixtures.add(testDef);
    }

    return expectedFixtures;
}

function getExpectedOutputFoldersForFixture(generator: GeneratorWorkspace, fixture: string): Set<string> | null {
    const fixtureConfig = generator.workspaceConfig.fixtures?.[fixture];
    if (fixtureConfig != null && fixtureConfig.length > 0) {
        return new Set(fixtureConfig.map((config) => config.outputFolder));
    }
    return null;
}

function getActualSeedFolders(generator: GeneratorWorkspace): string[] {
    const seedPath = generator.absolutePathToWorkspace;
    const files = fs.readdirSync(seedPath);
    return files.filter((file) => {
        const fullPath = path.join(seedPath, file);
        if (!fs.statSync(fullPath).isDirectory()) {
            return false;
        }
        if (file === "node_modules" || file === ".git") {
            return false;
        }
        return true;
    });
}

function getSubFolders(folderPath: AbsoluteFilePath): string[] {
    const files = fs.readdirSync(folderPath);
    return files.filter((file) => {
        const fullPath = path.join(folderPath, file);
        return fs.statSync(fullPath).isDirectory();
    });
}

export function findOrphanedSeedFolders(generators: GeneratorWorkspace[]): OrphanedFolder[] {
    const testDefinitions = getTestDefinitions();
    const orphanedFolders: OrphanedFolder[] = [];

    for (const generator of generators) {
        const expectedFixtures = getExpectedFixtures(generator, testDefinitions);
        const actualFolders = getActualSeedFolders(generator);

        for (const folder of actualFolders) {
            const folderPath = join(generator.absolutePathToWorkspace, RelativeFilePath.of(folder));

            if (!expectedFixtures.has(folder)) {
                orphanedFolders.push({
                    generator: generator.workspaceName,
                    folder,
                    absolutePath: folderPath
                });
                continue;
            }

            const expectedOutputFolders = getExpectedOutputFoldersForFixture(generator, folder);
            if (expectedOutputFolders != null) {
                const actualSubFolders = getSubFolders(folderPath);
                for (const subFolder of actualSubFolders) {
                    if (isLikelyOutputFolder(subFolder) && !expectedOutputFolders.has(subFolder)) {
                        orphanedFolders.push({
                            generator: generator.workspaceName,
                            folder,
                            subFolder,
                            absolutePath: join(folderPath, RelativeFilePath.of(subFolder))
                        });
                    }
                }
            }
        }
    }

    return orphanedFolders;
}

function isLikelyOutputFolder(folderName: string): boolean {
    const sharedFolderPatterns = [
        /^\./, // Hidden folders like .github, .mock
        /^src$/, // Source folder
        /^tests?$/, // Test folders
        /^node_modules$/, // Node modules
        /^__pycache__$/, // Python cache
        /^\.venv$/, // Python virtual environment
        /^dist$/, // Distribution folder
        /^build$/, // Build folder
        /^target$/ // Rust/Java target folder
    ];

    return !sharedFolderPatterns.some((pattern) => pattern.test(folderName));
}

export async function cleanOrphanedSeedFolders(
    generators: GeneratorWorkspace[],
    dryRun: boolean
): Promise<CleanResult> {
    const orphanedFolders = findOrphanedSeedFolders(generators);
    const deletedFolders: OrphanedFolder[] = [];

    if (orphanedFolders.length === 0) {
        CONSOLE_LOGGER.info("No orphaned seed folders found.");
        return { orphanedFolders, deletedFolders };
    }

    CONSOLE_LOGGER.info(`Found ${orphanedFolders.length} orphaned seed folder(s):`);
    for (const orphan of orphanedFolders) {
        const folderDisplay = orphan.subFolder != null ? `${orphan.folder}/${orphan.subFolder}` : orphan.folder;
        CONSOLE_LOGGER.info(`  - ${orphan.generator}/${folderDisplay}`);
    }

    if (dryRun) {
        CONSOLE_LOGGER.info("\nDry run mode - no folders were deleted.");
        return { orphanedFolders, deletedFolders };
    }

    CONSOLE_LOGGER.info("\nDeleting orphaned folders...");
    for (const orphan of orphanedFolders) {
        const folderDisplay = orphan.subFolder != null ? `${orphan.folder}/${orphan.subFolder}` : orphan.folder;
        try {
            await rm(orphan.absolutePath, { recursive: true, force: true });
            deletedFolders.push(orphan);
            CONSOLE_LOGGER.info(`  Deleted: ${orphan.generator}/${folderDisplay}`);
        } catch (error) {
            CONSOLE_LOGGER.error(`  Failed to delete ${orphan.generator}/${folderDisplay}: ${error}`);
        }
    }

    CONSOLE_LOGGER.info(`\nDeleted ${deletedFolders.length}/${orphanedFolders.length} orphaned folder(s).`);
    return { orphanedFolders, deletedFolders };
}
