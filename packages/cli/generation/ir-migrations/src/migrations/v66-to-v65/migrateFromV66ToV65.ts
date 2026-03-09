import { inflateIrNames, NormalizedIR } from "@fern-api/casings-generator";
import { GeneratorName } from "@fern-api/configuration-loader";
import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { IrMigrationContext } from "../../IrMigrationContext";
import { IrSerialization } from "../../ir-serialization";
import { IrVersions } from "../../ir-versions";
import { GeneratorWasNeverUpdatedToConsumeNewIR, IrMigration } from "../../types/IrMigration";

export const V66_TO_V65_MIGRATION: IrMigration<
    IrVersions.V66.ir.IntermediateRepresentation,
    IrVersions.V65.ir.IntermediateRepresentation
> = {
    laterVersion: "v66",
    earlierVersion: "v65",
    firstGeneratorVersionToConsumeNewIR: {
        [GeneratorName.TYPESCRIPT_NODE_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_BROWSER_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_EXPRESS]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_SPRING]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.OPENAPI_PYTHON_CLIENT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.OPENAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_FASTAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_PYDANTIC]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.STOPLIGHT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.POSTMAN]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUBY_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.CSHARP_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.CSHARP_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.SWIFT_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.SWIFT_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PHP_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PHP_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUST_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUST_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR
    },
    jsonifyEarlierVersion: (ir) =>
        IrSerialization.V65.IntermediateRepresentation.jsonOrThrow(ir, {
            unrecognizedObjectKeys: "passthrough",
            skipValidation: true
        }),
    migrateBackwards: (
        v66: IrVersions.V66.IntermediateRepresentation,
        _context: IrMigrationContext
    ): IrVersions.V65.ir.IntermediateRepresentation => {
        // V66 uses NameOrString (= string | Name) throughout the IR.
        // Strings are slim Names (just the original name); Name objects have all casings.
        // inflateIrNames() converts every string NameOrString to a full Name object,
        // then we strip the V66-only metadata fields (smartCasing, generationLanguage).
        const inflated = inflateIrNames(v66);

        // Construct V65 IR explicitly field-by-field so TypeScript type-checks every field.
        // After inflation, all NameOrString fields are full Name objects, making the
        // inflated IR structurally identical to V65 (which uses Name everywhere).
        return buildV65Ir(inflated);
    }
};

/**
 * Constructs a V65 IntermediateRepresentation from an inflated V66 IR.
 * Each field is mapped explicitly — the V66-only fields (smartCasing, generationLanguage) are omitted.
 *
 * After inflation, every NameOrString is a full Name object at runtime, making the inflated
 * IR structurally identical to V65. However, V66 types come from @fern-api/ir-sdk while V65
 * types come from @fern-fern/ir-v65-sdk — TypeScript can't prove cross-package structural
 * equivalence, so we cast the explicitly-constructed object at the return boundary.
 */
function buildV65Ir(inflated: NormalizedIR<IntermediateRepresentation>): IrVersions.V65.ir.IntermediateRepresentation {
    // Explicitly construct each field so that if a field is added to V65/V66,
    // the developer must update this mapping rather than silently passing through.
    const v65Ir = {
        fdrApiDefinitionId: inflated.fdrApiDefinitionId,
        apiVersion: inflated.apiVersion,
        apiName: inflated.apiName,
        apiDisplayName: inflated.apiDisplayName,
        apiDocs: inflated.apiDocs,
        auth: inflated.auth,
        headers: inflated.headers,
        idempotencyHeaders: inflated.idempotencyHeaders,
        types: inflated.types,
        services: inflated.services,
        webhookGroups: inflated.webhookGroups,
        websocketChannels: inflated.websocketChannels,
        errors: inflated.errors,
        subpackages: inflated.subpackages,
        rootPackage: inflated.rootPackage,
        constants: inflated.constants,
        environments: inflated.environments,
        basePath: inflated.basePath,
        pathParameters: inflated.pathParameters,
        errorDiscriminationStrategy: inflated.errorDiscriminationStrategy,
        sdkConfig: inflated.sdkConfig,
        variables: inflated.variables,
        serviceTypeReferenceInfo: inflated.serviceTypeReferenceInfo,
        readmeConfig: inflated.readmeConfig,
        sourceConfig: inflated.sourceConfig,
        publishConfig: inflated.publishConfig,
        dynamic: inflated.dynamic,
        selfHosted: inflated.selfHosted,
        audiences: inflated.audiences,
        generationMetadata: inflated.generationMetadata,
        apiPlayground: inflated.apiPlayground
    };

    // Cross-package cast: V66 types come from @fern-api/ir-sdk, V65 from @fern-fern/ir-v65-sdk.
    // Even though the data structures are identical after inflation, the _visit discriminant
    // functions have incompatible type signatures across packages, so TypeScript cannot prove
    // structural equivalence. This is the same pattern used by all other IR migrations
    // (e.g. v65-to-v63 uses 9 such casts). See TS2322 on _visit callback parameter types.
    return v65Ir as unknown as IrVersions.V65.ir.IntermediateRepresentation;
}
