import { readFile, rm } from "fs/promises";
import path from "path";
import { Project } from "ts-morph";
import { describe, expect, it } from "vitest";

import { DependencyType } from "../../dependency-manager/DependencyManager.js";
import { SimpleTypescriptProject } from "../SimpleTypescriptProject.js";

function makeProject(overrides: Partial<SimpleTypescriptProject.Init> = {}): SimpleTypescriptProject {
    return new SimpleTypescriptProject({
        runScripts: false,
        tsMorphProject: new Project({ useInMemoryFileSystem: true }),
        extraFiles: {},
        extraDependencies: {},
        extraPeerDependencies: {},
        extraPeerDependenciesMeta: {},
        extraDevDependencies: {},
        extraScripts: {},
        npmPackage: undefined,
        dependencies: {
            [DependencyType.PROD]: {},
            [DependencyType.DEV]: {},
            [DependencyType.PEER]: {}
        },
        extraConfigs: undefined,
        outputJsr: false,
        exportSerde: false,
        testPath: "tests",
        packageManager: "pnpm",
        formatter: "none",
        linter: "none",
        outputEsm: false,
        esmOnly: false,
        resolutions: {},
        useLegacyExports: false,
        ...overrides
    });
}

interface GeneratedProjectFiles {
    packageJson: Record<string, unknown>;
    hasCjsTsConfig: boolean;
    rootTsConfig: Record<string, unknown>;
}

async function generateProjectFiles(project: SimpleTypescriptProject): Promise<GeneratedProjectFiles> {
    const persisted = await project.persist();
    const directory = persisted.getRootDirectory();
    try {
        const packageJson = JSON.parse(await readFile(path.join(directory, "package.json"), "utf-8")) as Record<
            string,
            unknown
        >;
        const rootTsConfig = JSON.parse(await readFile(path.join(directory, "tsconfig.json"), "utf-8")) as Record<
            string,
            unknown
        >;
        let hasCjsTsConfig = true;
        try {
            await readFile(path.join(directory, "tsconfig.cjs.json"), "utf-8");
        } catch {
            hasCjsTsConfig = false;
        }
        return { packageJson, hasCjsTsConfig, rootTsConfig };
    } finally {
        await rm(directory, { recursive: true, force: true });
    }
}

describe("SimpleTypescriptProject", () => {
    it("generates dual CJS + ESM output by default", async () => {
        const { packageJson, hasCjsTsConfig, rootTsConfig } = await generateProjectFiles(makeProject());

        expect(packageJson.type).toBe("commonjs");
        expect(packageJson.main).toBe("./dist/cjs/index.js");
        expect(packageJson.types).toBe("./dist/cjs/index.d.ts");
        expect(packageJson.module).toBe("./dist/esm/index.mjs");
        expect((packageJson.exports as Record<string, unknown>)["."]).toEqual({
            import: {
                types: "./dist/esm/index.d.mts",
                default: "./dist/esm/index.mjs"
            },
            require: {
                types: "./dist/cjs/index.d.ts",
                default: "./dist/cjs/index.js"
            },
            default: "./dist/cjs/index.js"
        });
        const scripts = packageJson.scripts as Record<string, string>;
        expect(scripts["build:cjs"]).toBe("tsc --project ./tsconfig.cjs.json");
        expect(scripts["build:esm"]).toContain("tsc --project ./tsconfig.esm.json");
        expect(scripts["build:esm"]).toContain("node scripts/rename-to-esm-files.js");
        expect(scripts.build).toBe("pnpm build:cjs && pnpm build:esm");
        expect(hasCjsTsConfig).toBe(true);
        expect(rootTsConfig.extends).toBe("./tsconfig.cjs.json");
    });

    it("generates dual output with ESM defaults when outputEsm is true", async () => {
        const { packageJson, hasCjsTsConfig, rootTsConfig } = await generateProjectFiles(
            makeProject({ outputEsm: true })
        );

        expect(packageJson.type).toBe("module");
        expect(packageJson.main).toBe("./dist/esm/index.mjs");
        expect(packageJson.types).toBe("./dist/esm/index.d.mts");
        expect((packageJson.exports as Record<string, unknown>)["."]).toEqual({
            import: {
                types: "./dist/esm/index.d.mts",
                default: "./dist/esm/index.mjs"
            },
            require: {
                types: "./dist/cjs/index.d.ts",
                default: "./dist/cjs/index.js"
            },
            default: "./dist/esm/index.mjs"
        });
        const scripts = packageJson.scripts as Record<string, string>;
        expect(scripts["build:cjs"]).toBe("tsc --project ./tsconfig.cjs.json");
        expect(scripts.build).toBe("pnpm build:cjs && pnpm build:esm");
        expect(hasCjsTsConfig).toBe(true);
        expect(rootTsConfig.extends).toBe("./tsconfig.cjs.json");
    });

    it("generates ESM-only output when esmOnly is true", async () => {
        const { packageJson, hasCjsTsConfig, rootTsConfig } = await generateProjectFiles(
            makeProject({ esmOnly: true })
        );

        expect(packageJson.type).toBe("module");
        expect(packageJson.main).toBe("./dist/esm/index.mjs");
        expect(packageJson.types).toBe("./dist/esm/index.d.mts");
        expect((packageJson.exports as Record<string, unknown>)["."]).toEqual({
            types: "./dist/esm/index.d.mts",
            default: "./dist/esm/index.mjs"
        });
        expect(JSON.stringify(packageJson.exports)).not.toContain("require");
        expect(JSON.stringify(packageJson.exports)).not.toContain("dist/cjs");
        const scripts = packageJson.scripts as Record<string, string>;
        expect(scripts["build:cjs"]).toBeUndefined();
        expect(scripts["build:esm"]).toContain("tsc --project ./tsconfig.esm.json");
        expect(scripts["build:esm"]).toContain("node scripts/rename-to-esm-files.cjs");
        expect(scripts.build).toBe("pnpm build:esm");
        expect(hasCjsTsConfig).toBe(false);
        expect(rootTsConfig.extends).toBe("./tsconfig.esm.json");
    });
});
