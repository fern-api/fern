import { constructCasingsGenerator } from "@fern-api/casings-generator";
import { generatorsYml } from "@fern-api/configuration";
import { GeneratorName } from "@fern-api/configuration-loader";
import { Name } from "@fern-api/ir-sdk";
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
        // V66 adds smartCasing and generationLanguage metadata fields to the IR root.
        // These fields store the context needed to re-compute Name casings from originalName
        // when casings are stripped from Names (planned for a future IR version).
        //
        // V66 also includes an inflation utility (in @fern-api/casings-generator) that can
        // re-compute all Name casings from just originalName + these metadata fields.
        //
        // For V65 backward compatibility, we remove the new metadata fields.
        // If Names ever arrive without casings (future), we inflate them here first.
        //
        // NOTE: The inflateNamesDeep logic below is intentionally forward-looking.
        // In this version, Name casings are still always present so the inflation
        // code path won't trigger. It will become active in a follow-up PR that
        // strips casings from Name objects in the IR wire format.

        const generationLanguage = v66.generationLanguage as generatorsYml.GenerationLanguage | undefined;
        const smartCasing = v66.smartCasing ?? false;

        const casingsGenerator = constructCasingsGenerator({
            generationLanguage,
            keywords: undefined,
            smartCasing
        });

        function inflateNamesDeep(obj: unknown): unknown {
            if (obj == null || typeof obj !== "object") {
                return obj;
            }
            if (Array.isArray(obj)) {
                return obj.map(inflateNamesDeep);
            }

            const record = obj as Record<string, unknown>;

            // Check if this looks like a Name object (has originalName but missing casings)
            if (typeof record.originalName === "string") {
                if (
                    record.camelCase == null ||
                    record.pascalCase == null ||
                    record.snakeCase == null ||
                    record.screamingSnakeCase == null
                ) {
                    const generated = casingsGenerator.generateName(record.originalName);
                    const inflated: Name = {
                        originalName: record.originalName,
                        camelCase: (record.camelCase as Name["camelCase"]) ?? generated.camelCase,
                        pascalCase: (record.pascalCase as Name["pascalCase"]) ?? generated.pascalCase,
                        snakeCase: (record.snakeCase as Name["snakeCase"]) ?? generated.snakeCase,
                        screamingSnakeCase:
                            (record.screamingSnakeCase as Name["screamingSnakeCase"]) ?? generated.screamingSnakeCase
                    };
                    // Recurse into any nested objects within inflated Name
                    const result: Record<string, unknown> = {};
                    for (const [key, value] of Object.entries(inflated)) {
                        result[key] = inflateNamesDeep(value);
                    }
                    return result;
                }
            }

            // Recurse into all properties
            const result: Record<string, unknown> = {};
            for (const [key, value] of Object.entries(record)) {
                result[key] = inflateNamesDeep(value);
            }
            return result;
        }

        const inflatedIr = inflateNamesDeep(v66) as Record<string, unknown>;

        // Remove v66-only fields for v65 compatibility
        const { smartCasing: _, generationLanguage: __, ...v65Ir } = inflatedIr;

        return v65Ir as unknown as IrVersions.V65.ir.IntermediateRepresentation;
    }
};
