import { AbstractGeneratorCli } from "@fern-typescript/abstract-generator-cli";
import {
    JavaScriptRuntime,
    NpmPackage,
    PersistedTypescriptProject,
    fixImportsForEsm,
    writeTemplateFiles
} from "@fern-typescript/commons";
import { GeneratorContext } from "@fern-typescript/contexts";
import { SdkGenerator } from "@fern-typescript/sdk-generator";

import { FernGeneratorExec } from "@fern-api/base-generator";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { getNamespaceExport } from "@fern-api/typescript-base";

import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";

import { SdkCustomConfig } from "./custom-config/SdkCustomConfig";
import { SdkCustomConfigSchema } from "./custom-config/schema/SdkCustomConfigSchema";

export declare namespace SdkGeneratorCli {
    export interface Init {
        targetRuntime: JavaScriptRuntime;
        configOverrides?: Partial<SdkCustomConfig>;
    }
}

export class SdkGeneratorCli extends AbstractGeneratorCli<SdkCustomConfig> {
    private targetRuntime: JavaScriptRuntime;
    private configOverrides: Partial<SdkCustomConfig>;

    constructor({ targetRuntime, configOverrides }: SdkGeneratorCli.Init) {
        super();
        this.targetRuntime = targetRuntime;
        this.configOverrides = configOverrides ?? {};
    }

    protected parseCustomConfig(customConfig: unknown): SdkCustomConfig {
        const parsed = customConfig != null ? SdkCustomConfigSchema.parse(customConfig) : undefined;
        const noSerdeLayer = parsed?.noSerdeLayer ?? true;
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
            shouldGenerateWebsocketClients: parsed?.shouldGenerateWebsocketClients ?? false,
            includeUtilsOnUnionMembers: !noSerdeLayer && (parsed?.includeUtilsOnUnionMembers ?? false),
            includeOtherInUnionTypes: parsed?.includeOtherInUnionTypes ?? false,
            requireDefaultEnvironment: parsed?.requireDefaultEnvironment ?? false,
            defaultTimeoutInSeconds: parsed?.defaultTimeoutInSeconds ?? parsed?.timeoutInSeconds,
            skipResponseValidation: noSerdeLayer || (parsed?.skipResponseValidation ?? true),
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
            inlineFileProperties: parsed?.inlineFileProperties ?? true,
            inlinePathParameters: parsed?.inlinePathParameters ?? true,
            enableInlineTypes: parsed?.enableInlineTypes ?? true,
            packageJson: parsed?.packageJson,
            publishToJsr: parsed?.publishToJsr ?? false,
            omitUndefined: parsed?.omitUndefined ?? true,
            generateWireTests: parsed?.generateWireTests ?? true,
            noScripts: parsed?.noScripts ?? false,
            useBigInt: parsed?.useBigInt ?? false,
            useLegacyExports: parsed?.useLegacyExports ?? false,
            streamType: parsed?.streamType ?? "wrapper",
            fileResponseType: parsed?.fileResponseType ?? "stream",
            packagePath: parsed?.packagePath
        };
    }

    protected async generateTypescriptProject({
        config,
        customConfig: _customConfig,
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
        const customConfig = this.customConfigWithOverrides(_customConfig);
        const useLegacyExports = customConfig.useLegacyExports ?? false;
        const namespaceExport = getNamespaceExport({
            organization: config.organization,
            workspaceName: config.workspaceName,
            namespaceExport: customConfig.namespaceExport
        });
        const sdkGenerator = new SdkGenerator({
            namespaceExport,
            intermediateRepresentation,
            context: generatorContext,
            npmPackage,
            generateJestTests: this.shouldGenerateJestTests({ ir: intermediateRepresentation, config }),
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
                shouldGenerateWebsocketClients: customConfig.shouldGenerateWebsocketClients,
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
                inlineFileProperties: customConfig.inlineFileProperties ?? true,
                inlinePathParameters: customConfig.inlinePathParameters ?? true,
                writeUnitTests: customConfig.generateWireTests ?? config.writeUnitTests,
                executionEnvironment: this.executionEnvironment(config),
                packageJson: customConfig.packageJson,
                outputJsr: customConfig.publishToJsr ?? false,
                omitUndefined: customConfig.omitUndefined ?? true,
                useBigInt: customConfig.useBigInt ?? false,
                enableInlineTypes: customConfig.enableInlineTypes ?? true,
                useLegacyExports,
                generateWireTests: customConfig.generateWireTests ?? false,
                streamType: customConfig.streamType ?? "wrapper",
                fileResponseType: customConfig.fileResponseType ?? "stream",
                packagePath: customConfig.packagePath
            }
        });
        const typescriptProject = await sdkGenerator.generate();
        const persistedTypescriptProject = await typescriptProject.persist();
        const rootDirectory = persistedTypescriptProject.getRootDirectory();
        await sdkGenerator.copyCoreUtilities({
            pathToSrc: persistedTypescriptProject.getSrcDirectory(),
            pathToRoot: rootDirectory
        });
        await writeTemplateFiles(rootDirectory, this.getTemplateVariables(customConfig));
        await this.postProcess(persistedTypescriptProject, customConfig);

        return persistedTypescriptProject;
    }

    private getTemplateVariables(customConfig: SdkCustomConfig): Record<string, unknown> {
        return {
            streamType: customConfig.streamType,
            fileResponseType: customConfig.fileResponseType
        };
    }

    private async postProcess(
        persistedTypescriptProject: PersistedTypescriptProject,
        _customConfig: SdkCustomConfig
    ): Promise<void> {
        const customConfig = this.customConfigWithOverrides(_customConfig);
        if (customConfig.useLegacyExports === false) {
            await fixImportsForEsm(persistedTypescriptProject.getRootDirectory());
        }
    }

    protected isPackagePrivate(_customConfig: SdkCustomConfig): boolean {
        const customConfig = this.customConfigWithOverrides(_customConfig);
        return customConfig.isPackagePrivate;
    }

    protected outputSourceFiles(_customConfig: SdkCustomConfig): boolean {
        const customConfig = this.customConfigWithOverrides(_customConfig);
        return customConfig.outputSourceFiles;
    }

    protected shouldTolerateRepublish(_customConfig: SdkCustomConfig): boolean {
        const customConfig = this.customConfigWithOverrides(_customConfig);
        return customConfig.tolerateRepublish;
    }

    protected publishToJsr(_customConfig: SdkCustomConfig): boolean {
        const customConfig = this.customConfigWithOverrides(_customConfig);
        return customConfig.publishToJsr ?? false;
    }

    protected executionEnvironment(config: FernGeneratorExec.GeneratorConfig): "local" | "dev" | "prod" {
        return config.environment.type === "local"
            ? "local"
            : config.environment.coordinatorUrlV2.endsWith("dev2.buildwithfern.com")
              ? "dev"
              : "prod";
    }

    private customConfigWithOverrides(customConfig: SdkCustomConfig): SdkCustomConfig {
        return { ...customConfig, ...this.configOverrides };
    }

    private shouldGenerateJestTests({
        ir,
        config
    }: {
        ir: IntermediateRepresentation;
        config: FernGeneratorExec.GeneratorConfig;
    }): boolean {
        const hasGitHubOutputMode = config.output.mode.type === "github";
        const publishConfig = ir.publishConfig;
        switch (publishConfig?.type) {
            case "filesystem":
                return publishConfig.generateFullProject || hasGitHubOutputMode;
            case "github":
            case "direct":
            default:
                return hasGitHubOutputMode;
        }
    }
}
