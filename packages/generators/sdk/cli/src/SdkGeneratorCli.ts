import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { AbstractGeneratorCli } from "@fern-typescript/abstract-generator-cli";
import { JavaScriptRuntime, NpmPackage, PersistedTypescriptProject } from "@fern-typescript/commons";
import { GeneratorContext } from "@fern-typescript/contexts";
import { SdkGenerator } from "@fern-typescript/sdk-generator";
import { camelCase, upperFirst } from "lodash-es";
import { SdkCustomConfigSchema } from "./custom-config/schema/SdkCustomConfigSchema";
import { SdkCustomConfig } from "./custom-config/SdkCustomConfig";

export declare namespace SdkGeneratorCli {
    export interface Init {
        targetRuntime: JavaScriptRuntime;
    }
}

export class SdkGeneratorCli extends AbstractGeneratorCli<SdkCustomConfig> {
    private targetRuntime: JavaScriptRuntime;

    constructor({ targetRuntime }: SdkGeneratorCli.Init) {
        super();
        this.targetRuntime = targetRuntime;
    }

    protected parseCustomConfig(customConfig: unknown): SdkCustomConfig {
        const parsed = customConfig != null ? SdkCustomConfigSchema.parse(customConfig) : undefined;
        return {
            useBrandedStringAliases: parsed?.useBrandedStringAliases ?? false,
            isPackagePrivate: parsed?.private ?? false,
            neverThrowErrors: parsed?.neverThrowErrors ?? false,
            namespaceExport: parsed?.namespaceExport,
            outputEsm: parsed?.outputEsm ?? false,
            includeCredentialsOnCrossOriginRequests: parsed?.includeCredentialsOnCrossOriginRequests ?? false,
            shouldBundle: parsed?.bundle ?? false,
            allowCustomFetcher: parsed?.allowCustomFetcher ?? false,
            includeUtilsOnUnionMembers: parsed?.includeUtilsOnUnionMembers ?? false,
            includeOtherInUnionTypes: parsed?.includeOtherInUnionTypes ?? false,
            requireDefaultEnvironment: parsed?.requireDefaultEnvironment ?? false,
            timeoutInSeconds: parsed?.timeoutInSeconds,
            skipResponseValidation: parsed?.skipResponseValidation ?? false,
            extraDependencies: parsed?.extraDependencies ?? {},
        };
    }

    protected async generateTypescriptProject({
        config,
        customConfig,
        npmPackage,
        generatorContext,
        intermediateRepresentation,
    }: {
        config: FernGeneratorExec.GeneratorConfig;
        customConfig: SdkCustomConfig;
        npmPackage: NpmPackage;
        generatorContext: GeneratorContext;
        intermediateRepresentation: IntermediateRepresentation;
    }): Promise<PersistedTypescriptProject> {
        const namespaceExport =
            customConfig.namespaceExport ??
            `${upperFirst(camelCase(config.organization))}${upperFirst(camelCase(config.workspaceName))}`;

        const sdkGenerator = new SdkGenerator({
            namespaceExport,
            intermediateRepresentation,
            context: generatorContext,
            npmPackage,
            config: {
                shouldUseBrandedStringAliases: customConfig.useBrandedStringAliases,
                isPackagePrivate: customConfig.isPackagePrivate,
                neverThrowErrors: customConfig.neverThrowErrors,
                shouldBundle: customConfig.shouldBundle,
                outputEsm: customConfig.outputEsm,
                includeCredentialsOnCrossOriginRequests: customConfig.includeCredentialsOnCrossOriginRequests,
                allowCustomFetcher: customConfig.allowCustomFetcher,
                includeUtilsOnUnionMembers: customConfig.includeUtilsOnUnionMembers,
                includeOtherInUnionTypes: customConfig.includeOtherInUnionTypes,
                requireDefaultEnvironment: customConfig.requireDefaultEnvironment,
                timeoutInSeconds: customConfig.timeoutInSeconds,
                skipResponseValidation: customConfig.skipResponseValidation,
                targetRuntime: this.targetRuntime,
                extraDependencies: customConfig.extraDependencies,
            },
        });

        const typescriptProject = await sdkGenerator.generate();
        const persistedTypescriptProject = await typescriptProject.persist();
        await sdkGenerator.copyCoreUtilities({
            pathToSrc: persistedTypescriptProject.getSrcDirectory(),
        });

        return persistedTypescriptProject;
    }

    protected isPackagePrivate(customConfig: SdkCustomConfig): boolean {
        return customConfig.isPackagePrivate;
    }
}
