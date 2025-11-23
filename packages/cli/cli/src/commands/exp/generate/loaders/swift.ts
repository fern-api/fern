import { mkdir, stat } from "node:fs/promises";
import os from "node:os";
import { resolve as resolvePath } from "node:path";

import { generatorsYml } from "@fern-api/configuration-loader";
import { create as createTar, extract as extractTar } from "tar";
import { SdkGeneratorCLI } from "../types";

export async function loadSwiftGeneratorCLI(generatorVersion: string): Promise<SdkGeneratorCLI> {
    const cacheDir = await ensureSwiftGeneratorCached(generatorVersion);
    const modulePath = resolvePath(cacheDir, "dist", "api.cjs");

    const { SdkGeneratorCLI } = (await import(modulePath)) as {
        SdkGeneratorCLI: SdkGeneratorCLI;
    };
    return SdkGeneratorCLI;
}

async function ensureSwiftGeneratorCached(generatorVersion: string): Promise<string> {
    const cacheRoot = resolvePath(os.homedir(), ".fern", "generators", "node");
    const cacheDir = resolvePath(cacheRoot, generatorsYml.GenerationLanguage.SWIFT, generatorVersion);
    const cachedApiPath = resolvePath(cacheDir, "api.cjs");

    try {
        await stat(cachedApiPath);
        return cacheDir;
    } catch {
        // cache miss; fall through to "fetch" and populate
    }

    await mkdir(cacheDir, { recursive: true });

    const tarballPath = await fetchSwiftGeneratorTarballMock(generatorVersion);
    await extractTar({ file: tarballPath, cwd: cacheDir });

    return cacheDir;
}

async function fetchSwiftGeneratorTarballMock(generatorVersion: string): Promise<string> {
    // TODO(kafkas): Implement this.
    // In the future, this function will download the generator tarball from the registry.
    // For now, we mimic this behavior by creating a tarball from the local dist bundle.
    const localPackageRoot = resolvePath(__dirname, "../../../../../generators/swift/sdk");
    const tarballName = `${generatorsYml.GenerationLanguage.SWIFT}-${generatorVersion}.tgz`;
    const tarballPath = resolvePath(os.tmpdir(), tarballName);
    await createTar(
        {
            gzip: true,
            cwd: localPackageRoot,
            file: tarballPath
        },
        ["package.json", "features.yml", "dist"]
    );
    return tarballPath;
}
