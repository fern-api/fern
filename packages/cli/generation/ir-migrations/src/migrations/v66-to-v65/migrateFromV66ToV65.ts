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
        [GeneratorName.GO_FIBER]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUBY_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
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

        const generationLanguage = v66.generationLanguage as generatorsYml.GenerationLanguage | undefined;
        const smartCasing = v66.smartCasing ?? false;

        const casingsGenerator = constructCasingsGenerator({
            generationLanguage,
            keywords: undefined,
            smartCasing
        });

        // biome-ignore lint/suspicious/noExplicitAny: needed for deep object walking
        function inflateNamesDeep(obj: any): any {
            if (obj == null || typeof obj !== "object") {
                return obj;
            }
            if (Array.isArray(obj)) {
                return obj.map(inflateNamesDeep);
            }

            // Check if this looks like a Name object (has originalName but missing casings)
            if (typeof obj.originalName === "string") {
                if (
                    obj.camelCase == null ||
                    obj.pascalCase == null ||
                    obj.snakeCase == null ||
                    obj.screamingSnakeCase == null
                ) {
                    const generated = casingsGenerator.generateName(obj.originalName);
                    const inflated: Name = {
                        originalName: obj.originalName,
                        camelCase: obj.camelCase ?? generated.camelCase,
                        pascalCase: obj.pascalCase ?? generated.pascalCase,
                        snakeCase: obj.snakeCase ?? generated.snakeCase,
                        screamingSnakeCase: obj.screamingSnakeCase ?? generated.screamingSnakeCase
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
            for (const [key, value] of Object.entries(obj)) {
                result[key] = inflateNamesDeep(value);
            }
            return result;
        }

        const inflatedIr = inflateNamesDeep(v66);

        // Remove v66-only fields for v65 compatibility
        const { smartCasing: _, generationLanguage: __, ...v65Ir } = inflatedIr;

        return v65Ir as IrVersions.V65.ir.IntermediateRepresentation;
    }
};
