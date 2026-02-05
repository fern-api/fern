import { addDefaultDockerOrgIfNotPresent } from "@fern-api/configuration-loader";
import { createFdrGeneratorsSdkService, getIrVersionForGenerator } from "@fern-api/core";
import { isVersionAhead } from "@fern-api/semver-utils";

import { Rule, RuleViolation } from "../../Rule";

function getMaybeBadVersionMessage(
    generatorName: string,
    minCliVersion: string,
    cliVersion: string
): RuleViolation[] | undefined {
    if (!isVersionAhead(cliVersion, minCliVersion)) {
        return [
            {
                severity: "fatal",
                message: `The generator ${generatorName} requires CLI version ${minCliVersion} or later (current version: ${cliVersion}). Please run \`fern upgrade\` to upgrade your CLI version and use this generator.`
            }
        ];
    }
    return;
}

function getOverriddenIrVersion(irVersion: string): number {
    return Number(irVersion.replace("v", ""));
}

// NOTE: we do not throw in the event of a failure here, to account for using the generator offline
export const CompatibleIrVersionsRule: Rule = {
    name: "compatible-ir-version",
    create: async () => {
        return {
            generatorsYml: {
                generatorInvocation: async ({ invocation, cliVersion }) => {
                    const fdr = createFdrGeneratorsSdkService({ token: undefined });
                    if (cliVersion == null) {
                        return [];
                    }

                    // Pull the CLI release to get the IR version
                    const cliRelease = await fdr.generators.cli.getCliRelease(cliVersion);
                    // Again, this is to allow for offline usage, and other transient errors
                    if (!cliRelease.ok) {
                        return [];
                    }
                    const cliIrVersion = cliRelease.body.irVersion;

                    // Pull the generator release to get the IR version
                    let invocationIrVersion: number;
                    if (invocation["ir-version"] != null) {
                        // You've overridden the IR version in the generator invocation, let's clean it up
                        invocationIrVersion = getOverriddenIrVersion(invocation["ir-version"]);
                    } else {
                        // Normalize the generator name to add default Docker org prefix if not present
                        // This is needed because the YAML may contain shorthand names like "fern-csharp-sdk"
                        // but the FDR API expects fully-qualified names like "fernapi/fern-csharp-sdk"
                        const normalizedInvocation = {
                            ...invocation,
                            name: addDefaultDockerOrgIfNotPresent(invocation.name)
                        };
                        const maybeIrVersion = await getIrVersionForGenerator(normalizedInvocation);

                        // The above returns undefined if we can't get the IR version, so we'll just return an empty array
                        // Again, this is to allow for offline usage, and other transient errors
                        if (maybeIrVersion == null) {
                            return [];
                        }

                        invocationIrVersion = maybeIrVersion;
                    }

                    if (invocationIrVersion <= cliIrVersion) {
                        return [];
                    }

                    // If we've made it this far, we know the IR versions aren't a match, let's grab the min version
                    // and throw an error for the user telling them what to upgrade to to use this generator.
                    const minCliVersion = await fdr.generators.cli.getMinCliForIr(invocationIrVersion);
                    if (minCliVersion.ok) {
                        return getMaybeBadVersionMessage(invocation.name, minCliVersion.body.version, cliVersion) ?? [];
                    } else {
                        // Again, this is to allow for offline usage, and other transient errors
                        return [];
                    }
                }
            }
        };
    }
};
