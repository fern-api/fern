import { createWriteStream } from "node:fs";
import { mkdir, stat } from "node:fs/promises";
import os from "node:os";
import { resolve as resolvePath } from "node:path";

import { generatorsYml } from "@fern-api/configuration-loader";
import axios from "axios";
import { pipeline } from "stream/promises";
import { extract as extractTar } from "tar";
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
    const mockTarballUrl = "https://gitclout-dev.firebaseapp.com/swift-sdk-mock.tgz";
    const tarballName = `${generatorsYml.GenerationLanguage.SWIFT}-${generatorVersion}.tgz`;
    const tarballPath = resolvePath(os.tmpdir(), tarballName);
    const response = await axios.get(mockTarballUrl, { responseType: "stream" });
    await pipeline(response.data, createWriteStream(tarballPath));
    return tarballPath;
}
