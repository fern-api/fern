import { AbstractGeneratorCli } from "@fern-typescript/abstract-generator-cli";
import { NpmPackage, PersistedTypescriptProject } from "@fern-typescript/commons";
import { GeneratorContext } from "@fern-typescript/contexts";
import { ExpressGenerator } from "@fern-typescript/express-generator";
import { camelCase, upperFirst } from "lodash-es";

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";

import { ExpressCustomConfig } from "./custom-config/ExpressCustomConfig";
import { ExpressCustomConfigSchema } from "./custom-config/schema/ExpressCustomConfigSchema";

export class ExpressGeneratorCli extends AbstractGeneratorCli<ExpressCustomConfig> {
    protected parseCustomConfig(customConfig: unknown): ExpressCustomConfig {
        const parsed = customConfig != null ? ExpressCustomConfigSchema.parse(customConfig) : undefined;
        const noSerdeLayer = parsed?.noSerdeLayer ?? false;
        const enableInlineTypes = false; // hardcode, not supported in Express
        return {
            useBrandedStringAliases: parsed?.useBrandedStringAliases ?? false,
            areImplementationsOptional: parsed?.optionalImplementations ?? false,
            doNotHandleUnrecognizedErrors: parsed?.doNotHandleUnrecognizedErrors ?? false,
            includeUtilsOnUnionMembers: !noSerdeLayer && (parsed?.includeUtilsOnUnionMembers ?? false),
            includeOtherInUnionTypes: parsed?.includeOtherInUnionTypes ?? false,
            treatUnknownAsAny: parsed?.treatUnknownAsAny ?? false,
            noSerdeLayer,
            requestValidationStatusCode: parsed?.requestValidationStatusCode ?? 422,
            outputEsm: parsed?.outputEsm ?? false,
            outputSourceFiles: parsed?.outputSourceFiles ?? false,
            retainOriginalCasing: parsed?.retainOriginalCasing ?? false,
            allowExtraFields: parsed?.allowExtraFields ?? false,
            skipRequestValidation: parsed?.skipRequestValidation ?? false,
            skipResponseValidation: parsed?.skipResponseValidation ?? false,
            useBigInt: parsed?.useBigInt ?? false,
            noOptionalProperties: parsed?.noOptionalProperties ?? false,
            enableInlineTypes
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
        customConfig: ExpressCustomConfig;
        npmPackage: NpmPackage;
        generatorContext: GeneratorContext;
        intermediateRepresentation: IntermediateRepresentation;
    }): Promise<PersistedTypescriptProject> {
        const expressGenerator = new ExpressGenerator({
            namespaceExport: `${upperFirst(camelCase(config.organization))}${upperFirst(
                camelCase(config.workspaceName)
            )}`,
            intermediateRepresentation,
            context: generatorContext,
            npmPackage,
            config: {
                shouldUseBrandedStringAliases: customConfig.useBrandedStringAliases,
                areImplementationsOptional: customConfig.areImplementationsOptional,
                doNotHandleUnrecognizedErrors: customConfig.doNotHandleUnrecognizedErrors,
                includeUtilsOnUnionMembers: customConfig.includeUtilsOnUnionMembers,
                includeOtherInUnionTypes: customConfig.includeOtherInUnionTypes,
                treatUnknownAsAny: customConfig.treatUnknownAsAny,
                includeSerdeLayer: !customConfig.noSerdeLayer,
                outputEsm: customConfig.outputEsm,
                retainOriginalCasing: customConfig.retainOriginalCasing,
                allowExtraFields: customConfig.allowExtraFields,
                skipRequestValidation: customConfig.skipRequestValidation,
                skipResponseValidation: customConfig.skipResponseValidation,
                requestValidationStatusCode: customConfig.requestValidationStatusCode,
                useBigInt: customConfig.useBigInt,
                noOptionalProperties: customConfig.noOptionalProperties
            }
        });

        const typescriptProject = await expressGenerator.generate();
        const persistedTypescriptProject = await typescriptProject.persist();
        await expressGenerator.copyCoreUtilities({
            pathToSrc: persistedTypescriptProject.getSrcDirectory(),
            pathToRoot: persistedTypescriptProject.getRootDirectory()
        });

        return persistedTypescriptProject;
    }

    protected isPackagePrivate(): boolean {
        return false;
    }

    protected outputSourceFiles(customConfig: ExpressCustomConfig): boolean {
        return customConfig.outputSourceFiles;
    }

    protected shouldTolerateRepublish(customConfig: ExpressCustomConfig): boolean {
        return false;
    }

    protected publishToJsr(customConfig: ExpressCustomConfig): boolean {
        return false;
    }
}
