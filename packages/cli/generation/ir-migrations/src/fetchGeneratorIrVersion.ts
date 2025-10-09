import { generatorsYml } from "@fern-api/configuration-loader";
import { createFdrGeneratorsSdkService } from "@fern-api/core";

export interface GeneratorInvocationSchema {
    name: string;
    version: string;
    "ir-version"?: string;
}

function getOverriddenIrVersion(irVersion: string): number {
    return Number(irVersion.replace("v", ""));
}

/**
 * Fetches the IR version required by a generator from the FDR service.
 * This function is extracted from the generators-validator to be reused in IR migrations.
 *
 * @param invocation - The generator invocation containing name and version
 * @returns The IR version number, or undefined if it cannot be fetched (offline usage, errors, etc.)
 */
export async function fetchGeneratorIrVersion(invocation: GeneratorInvocationSchema): Promise<number | undefined> {
    // If there's an explicit IR version override, use that
    if (invocation["ir-version"] != null) {
        return getOverriddenIrVersion(invocation["ir-version"]);
    }

    try {
        const fdr = createFdrGeneratorsSdkService({ token: undefined });
        const generatorEntity = await fdr.generators.getGeneratorByImage({
            dockerImage: invocation.name
        });

        // Return undefined for offline usage and other transient errors
        if (!generatorEntity.ok || generatorEntity.body == null) {
            return undefined;
        }

        const generatorRelease = await fdr.generators.versions.getGeneratorRelease(
            generatorEntity.body.id,
            invocation.version
        );

        if (generatorRelease.ok) {
            return generatorRelease.body.irVersion;
        }

        return undefined;
    } catch (error) {
        // Silently handle errors to allow for offline usage
        return undefined;
    }
}

/**
 * Converts a generator invocation from the generators.yml format to the format expected by fetchGeneratorIrVersion
 */
export function generatorInvocationToSchema(invocation: generatorsYml.GeneratorInvocation): GeneratorInvocationSchema {
    return {
        name: invocation.name,
        version: invocation.version,
        "ir-version": invocation.irVersionOverride
    };
}
