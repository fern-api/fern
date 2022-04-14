import { MonorepoRoot, Package, PackageConfig, PackageType } from "@mrlint/commons";
import { readFile } from "fs/promises";
import glob from "glob";
import { IPackageJson } from "package-json-type";
import path from "path";
import { promisify } from "util";
import { z } from "zod";
import { readConfig } from "./readConfig";

const promisifiedGlob = promisify(glob);

const PackageConfigSchema = z.strictObject({
    type: z.enum(["library", "cli", "react-library", "react-app"]),
    private: z.optional(z.boolean()),
});
type RawPackageConfig = z.infer<typeof PackageConfigSchema>;

export async function getAllPackages(monorepoRoot: MonorepoRoot): Promise<Package[]> {
    const packages: Package[] = [];

    const rootPackageJson = await getPackageJson(monorepoRoot.fullPath);
    if (rootPackageJson == null) {
        throw new Error("No package.json found in monorepo root");
    }
    if (rootPackageJson.workspaces == null || rootPackageJson.workspaces.length === 0) {
        throw new Error("No 'workspaces' found in root package.json");
    }

    const mrlintFiles = await promisifiedGlob(
        `${monorepoRoot.fullPath}/${rootPackageJson.workspaces.join("|")}/.mrlint.json`
    );
    for (const mrlintFile of mrlintFiles) {
        const packageDirectory = path.dirname(mrlintFile);
        const rawConfig = await readConfig(mrlintFile, (contents) => PackageConfigSchema.parse(contents));
        packages.push({
            relativePath: path.relative(monorepoRoot.fullPath, packageDirectory),
            config: convertConfig(rawConfig),
            packageJson: await getPackageJson(packageDirectory),
        });
    }

    return packages;
}

async function getPackageJson(packageDirectory: string): Promise<IPackageJson | undefined> {
    try {
        const packageJson = (await readFile(path.join(packageDirectory, "package.json"))).toString();
        return JSON.parse(packageJson);
    } catch (e) {
        return undefined;
    }
}

function convertConfig(rawConfig: RawPackageConfig): PackageConfig {
    return {
        type: getType(rawConfig.type),
        private: rawConfig.private ?? true,
    };
}

function getType(rawType: RawPackageConfig["type"]): PackageType {
    switch (rawType) {
        case "cli":
            return PackageType.TYPESCRIPT_CLI;
        case "library":
            return PackageType.TYPESCRIPT_LIBRARY;
        case "react-library":
            return PackageType.REACT_LIBRARY;
        case "react-app":
            return PackageType.REACT_APP;
    }
}
