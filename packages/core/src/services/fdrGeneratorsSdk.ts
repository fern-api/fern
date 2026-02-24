import { FernRegistryClient as FdrClient } from "@fern-fern/generators-sdk";

export function createFdrGeneratorsSdkService({
    environment = process.env.DEFAULT_FDR_ORIGIN ?? "https://registry.buildwithfern.com",
    token
}: {
    environment?: string;
    token: (() => string) | string | undefined;
}): FdrClient {
    // biome-ignore lint/suspicious/noConsole: intentional debug logging for FDR registry diagnostics
    console.debug(`[FDR] Creating generators SDK service with environment: ${environment}`);
    return new FdrClient({
        environment,
        token
    });
}

export interface GeneratorInfo {
    name: string;
    version: string;
}

export async function getIrVersionForGenerator(invocation: GeneratorInfo): Promise<number | undefined> {
    const fdr = createFdrGeneratorsSdkService({ token: undefined });
    // biome-ignore lint/suspicious/noConsole: intentional debug logging for FDR registry diagnostics
    console.debug(`[FDR] getIrVersionForGenerator: looking up generator by image: ${invocation.name}`);
    const generatorEntity = await fdr.generators.getGeneratorByImage({
        dockerImage: invocation.name
    });
    // Again, this is to allow for offline usage, and other transient errors
    if (!generatorEntity.ok || generatorEntity.body == null) {
        // biome-ignore lint/suspicious/noConsole: intentional debug logging for FDR registry diagnostics
        console.debug(
            `[FDR] getIrVersionForGenerator: getGeneratorByImage failed for ${invocation.name}`,
            generatorEntity
        );
        return undefined;
    }
    // biome-ignore lint/suspicious/noConsole: intentional debug logging for FDR registry diagnostics
    console.debug(
        `[FDR] getIrVersionForGenerator: found generator id=${generatorEntity.body.id}, fetching release version=${invocation.version}`
    );
    const generatorRelease = await fdr.generators.versions.getGeneratorRelease(
        generatorEntity.body.id,
        invocation.version
    );

    if (generatorRelease.ok) {
        // biome-ignore lint/suspicious/noConsole: intentional debug logging for FDR registry diagnostics
        console.debug(
            `[FDR] getIrVersionForGenerator: got release for ${invocation.name}@${invocation.version}, irVersion=${generatorRelease.body.irVersion}`
        );
        // We've pulled the generator release, let's get it's IR version
        return generatorRelease.body.irVersion;
    }

    // biome-ignore lint/suspicious/noConsole: intentional debug logging for FDR registry diagnostics
    console.debug(
        `[FDR] getIrVersionForGenerator: getGeneratorRelease failed for ${generatorEntity.body.id}@${invocation.version}`,
        generatorRelease
    );
    return undefined;
}
