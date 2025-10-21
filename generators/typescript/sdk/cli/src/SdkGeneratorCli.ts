import { FernGeneratorExec } from "@fern-api/base-generator";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { Logger } from "@fern-api/logger";
import { getNamespaceExport } from "@fern-api/typescript-base";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { AbstractGeneratorCli } from "@fern-typescript/abstract-generator-cli";
import {
    convertJestImportsToVitest,
    fixImportsForEsm,
    NpmPackage,
    PersistedTypescriptProject,
    writeTemplateFiles
} from "@fern-typescript/commons";
import { GeneratorContext } from "@fern-typescript/contexts";
import { SdkGenerator } from "@fern-typescript/sdk-generator";

import { SdkCustomConfig } from "./custom-config/SdkCustomConfig";
import { SdkCustomConfigSchema } from "./custom-config/schema/SdkCustomConfigSchema";

export declare namespace SdkGeneratorCli {
    export interface Init {
        configOverrides?: Partial<SdkCustomConfig>;
    }
}

export class SdkGeneratorCli extends AbstractGeneratorCli<SdkCustomConfig> {
    private configOverrides: Partial<SdkCustomConfig>;

    constructor({ configOverrides }: SdkGeneratorCli.Init = {}) {
        super();
        this.configOverrides = configOverrides ?? {};
    }

    protected parseCustomConfig(customConfig: unknown, logger: Logger): SdkCustomConfig {
        const parsed = customConfig != null ? SdkCustomConfigSchema.parse(customConfig) : undefined;
        const noSerdeLayer = parsed?.noSerdeLayer ?? true;
        const config = {
            useBrandedStringAliases: parsed?.useBrandedStringAliases ?? false,
            outputSourceFiles: parsed?.outputSourceFiles ?? true,
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
            streamType: parsed?.streamType ?? "web",
            fileResponseType: parsed?.fileResponseType ?? "binary-response",
            formDataSupport: parsed?.formDataSupport ?? "Node18",
            fetchSupport: parsed?.fetchSupport ?? "native",
            packagePath: parsed?.packagePath,
            omitFernHeaders: parsed?.omitFernHeaders ?? false,
            useDefaultRequestParameterValues: parsed?.useDefaultRequestParameterValues ?? false,
            packageManager: parsed?.packageManager ?? "pnpm",
            generateReadWriteOnlyTypes: parsed?.experimentalGenerateReadWriteOnlyTypes ?? false,
            flattenRequestParameters: parsed?.flattenRequestParameters ?? false,
            exportAllRequestsAtRoot: parsed?.exportAllRequestsAtRoot ?? false,
            testFramework: parsed?.testFramework ?? "vitest",
            consolidateTypeFiles: parsed?.consolidateTypeFiles ?? false,
            generateEndpointMetadata: parsed?.generateEndpointMetadata ?? false,
            wireTestsFallbackToAutoGeneratedErrorExamples:
                parsed?.wireTestsFallbackToAutoGeneratedErrorExamples ?? true,
            linter: parsed?.linter ?? "biome",
            formatter: parsed?.formatter ?? "biome"
        };

        if (parsed?.noSerdeLayer === false && typeof parsed?.enableInlineTypes === "undefined") {
            logger.info(
                "noSerdeLayer is explicitly false while enableInlineTypes is implicitly true. Changing enableInlineTypes to false."
            );
            config.enableInlineTypes = false;
        }
        if (parsed?.noSerdeLayer === false && parsed?.enableInlineTypes === true) {
            logger.error("Incompatible configuration: noSerdeLayer cannot be false while enableInlineTypes is true.");
        }
        if (parsed?.noSerdeLayer === false && parsed?.experimentalGenerateReadWriteOnlyTypes === true) {
            logger.error(
                "Incompatible configuration: noSerdeLayer cannot be false while experimentalGenerateReadWriteOnlyTypes is true."
            );
        }
        const isUsingVitest = (parsed?.testFramework ?? "vitest") === "vitest";
        if (isUsingVitest) {
            if (parsed?.useBigInt) {
                logger.error(
                    "`testFramework` `vitest` does not currently support BigInt. Please set `useBigInt` to `false` or set `testFramework` to `jest`."
                );
            }
            if (parsed?.streamType === "wrapper") {
                logger.error(
                    "`testFramework` `vitest` does not currently support `streamType` `wrapper`. Please set `streamType` to `web` or `node` or set `testFramework` to `jest`."
                );
            }
            if (parsed?.packagePath != null) {
                logger.error(
                    "`testFramework` `vitest` does not currently support `packagePath`. Please remove `packagePath` or set `testFramework` to `jest`."
                );
            }
        }

        return config;
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
                streamType: customConfig.streamType ?? "web",
                fileResponseType: customConfig.fileResponseType ?? "binary-response",
                formDataSupport: customConfig.formDataSupport ?? "Node18",
                fetchSupport: customConfig.fetchSupport ?? "native",
                packagePath: customConfig.packagePath,
                omitFernHeaders: customConfig.omitFernHeaders ?? false,
                useDefaultRequestParameterValues: customConfig.useDefaultRequestParameterValues ?? false,
                packageManager: customConfig.packageManager,
                generateReadWriteOnlyTypes: customConfig.generateReadWriteOnlyTypes,
                flattenRequestParameters: customConfig.flattenRequestParameters ?? false,
                exportAllRequestsAtRoot: customConfig.exportAllRequestsAtRoot ?? false,
                testFramework: customConfig.testFramework,
                consolidateTypeFiles: customConfig.consolidateTypeFiles ?? false,
                generateEndpointMetadata: customConfig.generateEndpointMetadata ?? false,
                wireTestsFallbackToAutoGeneratedErrorExamples:
                    customConfig.wireTestsFallbackToAutoGeneratedErrorExamples ?? true,
                formatter: customConfig.formatter,
                linter: customConfig.linter
            }
        });
        const typescriptProject = await sdkGenerator.generate();
        const persistedTypescriptProject = await typescriptProject.persist();
        const rootDirectory = persistedTypescriptProject.getRootDirectory();
        await sdkGenerator.copyCoreUtilities({
            pathToSrc: persistedTypescriptProject.getSrcDirectory(),
            pathToRoot: rootDirectory
        });
        await sdkGenerator.generatePublicExports({
            pathToSrc: persistedTypescriptProject.getSrcDirectory()
        });
        await writeTemplateFiles(rootDirectory, this.getTemplateVariables(customConfig));
        await this.postProcess(persistedTypescriptProject, customConfig);

        return persistedTypescriptProject;
    }

    private getTemplateVariables(customConfig: SdkCustomConfig): Record<string, unknown> {
        return {
            streamType: customConfig.streamType,
            fileResponseType: customConfig.fileResponseType,
            formDataSupport: customConfig.formDataSupport,
            fetchSupport: customConfig.fetchSupport
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
        if (customConfig.testFramework === "vitest") {
            await convertJestImportsToVitest(
                persistedTypescriptProject.getRootDirectory(),
                persistedTypescriptProject.getTestDirectory()
            );
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

    protected getPackageManager(customConfig: SdkCustomConfig): "pnpm" | "yarn" {
        return customConfig.packageManager;
    }
}
