import { FernRegistryClient as FdrClient } from "@fern-fern/generators-sdk";

export function createFdrGeneratorsSdkService({
    environment = process.env.DEFAULT_FDR_ORIGIN ?? "https://registry.buildwithfern.com",
    token
}: {
    environment?: string;
    token: (() => string) | string | undefined;
}): FdrClient {
    return new FdrClient({
        environment,
        token
    });
}

export interface GeneratorInfo {
    name: string;
    version: string;
}

export async function getIrVersionForGenerator(
    invocation: GeneratorInfo
): Promise<number | undefined> {
    const fdr = createFdrGeneratorsSdkService({ token: undefined });
    const generatorEntity = await fdr.generators.getGeneratorByImage({
        dockerImage: invocation.name
    });
    // Again, this is to allow for offline usage, and other transient errors
    if (!generatorEntity.ok || generatorEntity.body == null) {
        return undefined;
    }
    const generatorRelease = await fdr.generators.versions.getGeneratorRelease(
        generatorEntity.body.id,
        invocation.version
    );

    if (generatorRelease.ok) {
        // We've pulled the generator release, let's get it's IR version
        return generatorRelease.body.irVersion;
    }

    return undefined;
}