import { NpmPackage } from "@fern-typescript/commons";

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";

export function constructNpmPackage({
    generatorConfig,
    isPackagePrivate
}: {
    generatorConfig: FernGeneratorExec.GeneratorConfig;
    isPackagePrivate: boolean;
}): NpmPackage | undefined {
    const outputMode = generatorConfig.output.mode;
    switch (outputMode.type) {
        case "downloadFiles":
            return undefined;
        case "publish":
            return {
                packageName: outputMode.registriesV2.npm.packageName,
                version: outputMode.version,
                private: isPackagePrivate,
                publishInfo: {
                    registryUrl: outputMode.registriesV2.npm.registryUrl,
                    token: outputMode.registriesV2.npm.token
                },
                license: undefined,
                repoUrl: undefined
            };
        case "github":
            if (outputMode.publishInfo != null && outputMode.publishInfo.type !== "npm") {
                throw new Error(
                    `Expected to receive npm publish info but received ${outputMode.publishInfo.type} instead`
                );
            }
            return {
                packageName: outputMode.publishInfo != null ? outputMode.publishInfo.packageName : "",
                version: outputMode.version,
                private: isPackagePrivate,
                publishInfo: undefined,
                repoUrl: outputMode.repoUrl,
                license: generatorConfig.license?._visit({
                    basic: (basic) => basic.id,
                    custom: (custom) => `See ${custom.filename}`,
                    _other: () => {
                        return undefined;
                    }
                })
            };
        default:
            throw new Error(`Encountered unknown output mode: ${outputMode}`);
    }
}
