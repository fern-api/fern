import { AbstractGeneratorCli } from "@fern-typescript/abstract-generator-cli";
import { JavaScriptRuntime, NpmPackage, PersistedTypescriptProject } from "@fern-typescript/commons";
import { GeneratorContext } from "@fern-typescript/contexts";
import { SdkGenerator } from "@fern-typescript/sdk-generator";
import { camelCase, upperFirst } from "lodash-es";

import { FernGeneratorExec } from "@fern-api/base-generator";
import { AbsoluteFilePath } from "@fern-api/fs-utils";

import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";

import { SdkCustomConfig } from "./custom-config/SdkCustomConfig";
import { SdkCustomConfigSchema } from "./custom-config/schema/SdkCustomConfigSchema";

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
        const noSerdeLayer = parsed?.noSerdeLayer ?? false;
        return {
            useBrandedStringAliases: parsed?.useBrandedStringAliases ?? false,
            outputSourceFiles: parsed?.outputSourceFiles ?? false,
            isPackagePrivate: parsed?.private ?? false,
            neverThrowErrors: parsed?.neverThrowErrors ?? false,
            namespaceExport: parsed?.namespaceExport,
            outputEsm: parsed?.outputEsm ?? false,
            includeCredentialsOnCrossOriginRequests: parsed?.includeCredentialsOnCrossOriginRequests ?? false,
            shouldBundle: parsed?.bundle ?? false,
            allowCustomFetcher: parsed?.allowCustomFetcher ?? false,
            includeUtilsOnUnionMembers: !noSerdeLayer && (parsed?.includeUtilsOnUnionMembers ?? false),
            includeOtherInUnionTypes: parsed?.includeOtherInUnionTypes ?? false,
            requireDefaultEnvironment: parsed?.requireDefaultEnvironment ?? false,
            defaultTimeoutInSeconds: parsed?.defaultTimeoutInSeconds ?? parsed?.timeoutInSeconds,
            skipResponseValidation: noSerdeLayer || (parsed?.skipResponseValidation ?? false),
            extraDependencies: parsed?.extraDependencies ?? {},
            extraDevDependencies: parsed?.extraDevDependencies ?? {},
            treatUnknownAsAny: parsed?.treatUnknownAsAny ?? false,
            includeContentHeadersOnFileDownloadResponse: parsed?.includeContentHeadersOnFileDownloadResponse ?? false,
            noSerdeLayer,
            extraPeerDependencies: parsed?.extraPeerDependencies ?? {},
            extraPeerDependenciesMeta: parsed?.extraPeerDependenciesMeta ?? {},
            noOptionalProperties: parsed?.noOptionalProperties ?? false,
            includeApiReference: parsed?.includeApiReference ?? false,
            tolerateRepublish: parsed?.tolerateRepublish ?? false,
            retainOriginalCasing: parsed?.retainOriginalCasing ?? false,
            allowExtraFields: parsed?.allowExtraFields ?? false,
            inlineFileProperties: parsed?.inlineFileProperties ?? false,
            inlinePathParameters: parsed?.inlinePathParameters ?? false,
            enableInlineTypes: parsed?.enableInlineTypes ?? false,
            packageJson: parsed?.packageJson,
            publishToJsr: parsed?.publishToJsr ?? false,
            omitUndefined: parsed?.omitUndefined ?? false,
            generateWireTests: parsed?.generateWireTests ?? false,
            noScripts: parsed?.noScripts ?? false,
            useBigInt: parsed?.useBigInt ?? false
        };
    }

    protected async generateTypescriptProject({
        config,
        customConfig,
        npmPackage,
        generatorContext,
        intermediateRepresentation
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
            generateJestTests: config.output.mode.type === "github",
            rawConfig: config,
            config: {
                runScripts: !customConfig.noScripts,
                organization: config.organization,
                apiName: intermediateRepresentation.apiName.originalName,
                whitelabel: config.whitelabel,
                generateOAuthClients: config.generateOauthClients,
                originalReadmeFilepath:
                    config.originalReadmeFilepath != null
                        ? AbsoluteFilePath.of(config.originalReadmeFilepath)
                        : undefined,
                snippetFilepath:
                    config.output.snippetFilepath != null
                        ? AbsoluteFilePath.of(config.output.snippetFilepath)
                        : undefined,
                snippetTemplateFilepath:
                    config.output.snippetTemplateFilepath != null
                        ? AbsoluteFilePath.of(config.output.snippetTemplateFilepath)
                        : undefined,
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
                defaultTimeoutInSeconds: customConfig.defaultTimeoutInSeconds,
                skipResponseValidation: customConfig.skipResponseValidation,
                targetRuntime: this.targetRuntime,
                extraDevDependencies: customConfig.extraDevDependencies,
                extraDependencies: customConfig.extraDependencies,
                extraPeerDependencies: customConfig.extraPeerDependencies ?? {},
                extraPeerDependenciesMeta: customConfig.extraPeerDependenciesMeta ?? {},
                treatUnknownAsAny: customConfig.treatUnknownAsAny,
                includeContentHeadersOnFileDownloadResponse: customConfig.includeContentHeadersOnFileDownloadResponse,
                includeSerdeLayer: !customConfig.noSerdeLayer,
                retainOriginalCasing: customConfig.retainOriginalCasing ?? false,
                noOptionalProperties: customConfig.noOptionalProperties,
                tolerateRepublish: customConfig.tolerateRepublish,
                allowExtraFields: customConfig.allowExtraFields ?? false,
                inlineFileProperties: customConfig.inlineFileProperties ?? false,
                inlinePathParameters: customConfig.inlinePathParameters ?? false,
                writeUnitTests: customConfig.generateWireTests ?? config.writeUnitTests,
                executionEnvironment: this.exectuionEnvironment(config),
                packageJson: customConfig.packageJson,
                outputJsr: customConfig.publishToJsr ?? false,
                omitUndefined: customConfig.omitUndefined ?? false,
                useBigInt: customConfig.useBigInt ?? false,
                enableInlineTypes: customConfig.enableInlineTypes ?? false
            }
        });
        const typescriptProject = await sdkGenerator.generate();
        const persistedTypescriptProject = await typescriptProject.persist();
        await sdkGenerator.copyCoreUtilities({
            pathToSrc: persistedTypescriptProject.getSrcDirectory(),
            pathToRoot: persistedTypescriptProject.getRootDirectory()
        });

        return persistedTypescriptProject;
    }

    protected isPackagePrivate(customConfig: SdkCustomConfig): boolean {
        return customConfig.isPackagePrivate;
    }

    protected outputSourceFiles(customConfig: SdkCustomConfig): boolean {
        return customConfig.outputSourceFiles;
    }

    protected shouldTolerateRepublish(customConfig: SdkCustomConfig): boolean {
        return customConfig.tolerateRepublish;
    }

    protected publishToJsr(customConfig: SdkCustomConfig): boolean {
        return customConfig.publishToJsr ?? false;
    }

    protected exectuionEnvironment(config: FernGeneratorExec.GeneratorConfig): "local" | "dev" | "prod" {
        return config.environment.type === "local"
            ? "local"
            : config.environment.coordinatorUrlV2.endsWith("dev2.buildwithfern.com")
              ? "dev"
              : "prod";
    }
}
