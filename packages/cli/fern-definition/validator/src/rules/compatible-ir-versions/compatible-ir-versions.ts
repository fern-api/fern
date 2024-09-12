import { createFdrGeneratorsSdkService } from "@fern-api/core";
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
                severity: "error",
                message: `The generator ${generatorName} requires CLI version ${minCliVersion} or later (current version: ${cliVersion}).`
            }
        ];
    }
    return;
}

export const CompatibleIrVersionsRule: Rule = {
    name: "compatible-ir-version",
    create: async () => {
        return {
            generatorsYml: {
                generatorInvocation: async (invocation) => {
                    const fdr = createFdrGeneratorsSdkService({ token: undefined });
                    // TODO: is there a better way to do this? I feel like I can't bring a dep on the cli package
                    // I also feel like we shouldn't throw or error if we can't get the CLI version, so just returning here.
                    const cliVersion = process.env.CLI_VERSION;
                    if (cliVersion == null) {
                        return [];
                    }

                    // Pull the CLI release to get the IR version
                    const cliRelease = await fdr.generators.cli.getCliRelease(cliVersion);
                    if (!cliRelease.ok) {
                        return [];
                    }
                    const cliIrVersion = cliRelease.body.irVersion;

                    // Pull the generator release to get the IR version
                    let invocationIrVersion: number;
                    if (invocation["ir-version"] != null) {
                        // You've overridden the IR version in the generator invocation, let's clean it up
                        invocationIrVersion = Number(invocation["ir-version"].replace("v", ""));
                        if (cliIrVersion >= invocationIrVersion) {
                            // You've overridden the IR version and you're on a CLI that works with it!
                            return [];
                        }
                    } else {
                        const generatorEntity = await fdr.generators.getGeneratorByImage({
                            dockerImage: invocation.name
                        });
                        if (!generatorEntity.ok) {
                            return [];
                        }
                        const generatorRelease = await fdr.generators.versions.getGeneratorRelease(
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            generatorEntity.body!.id,
                            invocation.version
                        );

                        if (generatorRelease.ok) {
                            // We've pulled the generator release, let's get it's IR version
                            invocationIrVersion = generatorRelease.body.irVersion;
                            if (cliIrVersion >= generatorRelease.body.irVersion) {
                                // You're on a CLI that works with the generator you have specified!
                                return [];
                            }
                        } else {
                            // We don't have a generator release for this generator, so we can't validate it.
                            return [];
                        }
                    }

                    // If we've made it this far, we know the IR versions aren't a match, let's grab the min version
                    // and throw an error for the user telling them what to upgrade to to use this generator.
                    const minCliVersion = await fdr.generators.cli.getMinCliForIr(invocationIrVersion);
                    if (minCliVersion.ok) {
                        return getMaybeBadVersionMessage(invocation.name, minCliVersion.body.version, cliVersion) ?? [];
                    } else {
                        throw new Error(
                            `Failed to get min CLI version for IR version ${invocationIrVersion} ${JSON.stringify(
                                minCliVersion
                            )}`
                        );
                    }
                    // return [];
                }
            }
        };
    }
};
