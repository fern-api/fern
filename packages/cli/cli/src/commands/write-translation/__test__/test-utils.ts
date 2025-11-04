import { docsYml, fernConfigJson } from "@fern-api/configuration-loader";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { Project } from "@fern-api/project-loader";
import { DocsWorkspace } from "@fern-api/workspace-loader";
import { cp, mkdir } from "fs/promises";
import path from "path";
import tmp from "tmp-promise";

export interface TestFixture {
    name: string;
    description?: string;
    expectedLanguages?: string[];
}

export const FIXTURES: Record<string, TestFixture> = {
    "basic-project": {
        name: "basic-project",
        description: "A basic project with languages configured",
        expectedLanguages: ["de", "es"] // Only target languages - source language ("en") should not have directory
    },
    "no-languages-project": {
        name: "no-languages-project",
        description: "A project without languages configured",
        expectedLanguages: []
    },
    "path-url-project": {
        name: "path-url-project",
        description: "A project with URLs containing paths to test language prefix insertion",
        expectedLanguages: ["de", "es"]
    }
};

/**
 * Sets up a test project from a fixture in a temporary directory
 */
export async function setupTestProjectFromFixture(fixtureName: string): Promise<{
    tempDir: tmp.DirectoryResult;
    fernDir: AbsoluteFilePath;
    project: Project;
}> {
    const fixture = FIXTURES[fixtureName];
    if (!fixture) {
        throw new Error(`Unknown fixture: ${fixtureName}. Available fixtures: ${Object.keys(FIXTURES).join(", ")}`);
    }

    // Create temporary directory
    const tempDir = await tmp.dir();
    const fernDir = join(AbsoluteFilePath.of(tempDir.path), RelativeFilePath.of("fern"));

    // Copy fixture to temp directory
    // Determine the fixtures path - handle both src and lib directory structures
    const isCompiledCode = __dirname.includes("/lib/");
    const baseDir = isCompiledCode
        ? path.join(__dirname, "..", "..", "..", "..", "src", "commands", "write-translation", "__test__")
        : __dirname;
    const fixturesPath = path.join(baseDir, "fixtures", fixture.name);
    await mkdir(fernDir, { recursive: true });
    await cp(fixturesPath, fernDir, { recursive: true });

    // Create mock project based on the fixture
    const project = await createMockProjectFromFernDir(fernDir);

    return { tempDir, fernDir, project };
}

/**
 * Creates a mock Project object from a fern directory
 */
async function createMockProjectFromFernDir(fernDir: AbsoluteFilePath): Promise<Project> {
    const fs = await import("fs/promises");
    const yaml = await import("js-yaml");

    // Read docs.yml to determine the configuration
    const docsYmlPath = join(fernDir, RelativeFilePath.of("docs.yml"));
    const docsYmlContent = await fs.readFile(docsYmlPath, "utf-8");
    const parsedDocsYml = yaml.load(docsYmlContent) as Record<string, unknown>;

    // Remove debug logging

    const docsWorkspace: DocsWorkspace = {
        type: "docs",
        workspaceName: undefined,
        absoluteFilePath: fernDir,
        absoluteFilepathToDocsConfig: docsYmlPath,
        config: {
            instances: [],
            ...parsedDocsYml
        } as docsYml.RawSchemas.DocsConfiguration
    };

    return {
        docsWorkspaces: docsWorkspace,
        config: {
            _absolutePath: fernDir,
            rawConfig: {},
            organization: "test-org",
            version: "0.0.1"
        } as fernConfigJson.ProjectConfig,
        apiWorkspaces: [],
        loadAPIWorkspace: () => undefined
    } as Project;
}
