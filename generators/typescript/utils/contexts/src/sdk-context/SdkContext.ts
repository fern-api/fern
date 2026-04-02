import { CaseConverter, GeneratorNotificationService } from "@fern-api/base-generator";
import { Logger } from "@fern-api/logger";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { FernIr } from "@fern-fern/ir-sdk";
import { ExportsManager, NpmPackage } from "@fern-typescript/commons";

import { BaseClientContext } from "./base-client/BaseClientContext.js";

/**
 * SdkContext — stable, created once per generation run.
 * Contains IR, config, feature flags, referencers, resolvers, and generators.
 * Does NOT include per-source-file state (sourceFile, importsManager, sub-contexts).
 *
 * @see FileContext for the per-file extension.
 */
export interface SdkContext {
    case: CaseConverter;
    logger: Logger;
    version: string | undefined;
    ir: FernIr.IntermediateRepresentation;
    config: FernGeneratorExec.GeneratorConfig;
    generatorNotificationService: GeneratorNotificationService;
    npmPackage: NpmPackage | undefined;
    namespaceExport: string;
    exportsManager: ExportsManager;
    baseClient: BaseClientContext;
    includeSerdeLayer: boolean;
    retainOriginalCasing: boolean;
    generateOAuthClients: boolean;
    enableInlineTypes: boolean;
    inlineFileProperties: boolean;
    omitUndefined: boolean;
    neverThrowErrors: boolean;
    flattenRequestParameters: boolean;
}
