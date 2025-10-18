import { AbstractGeneratorCli } from "@fern-api/base-generator";
import { BaseRustCustomConfigSchema } from "@fern-api/rust-codegen";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import * as IrSerialization from "@fern-fern/ir-sdk/serialization";
import { readFile } from "fs/promises";
import { AbstractRustGeneratorContext } from "../context/AbstractRustGeneratorContext";

export abstract class AbstractRustGeneratorCli<
    CustomConfig extends BaseRustCustomConfigSchema,
    RustGeneratorContext extends AbstractRustGeneratorContext<CustomConfig>
> extends AbstractGeneratorCli<CustomConfig, IntermediateRepresentation, RustGeneratorContext> {
    protected async parseIntermediateRepresentation(irFilepath: string): Promise<IntermediateRepresentation> {
        // Read and parse the IR file manually to add preprocessing
        const irContent = await readFile(irFilepath, "utf-8");
        const irJson = JSON.parse(irContent);

        // Ensure auth schemes have required 'key' field for IR v60+ compatibility
        // This handles cases where the CLI's OpenAPI converter doesn't provide the key
        if (irJson && typeof irJson === "object" && "auth" in irJson) {
            const auth = irJson.auth as Record<string, unknown>;
            if (auth && auth.schemes && Array.isArray(auth.schemes)) {
                auth.schemes = auth.schemes.map((scheme: Record<string, unknown>, index: number) => {
                    if (!scheme.key) {
                        // Use the auth type as the key, or generate a default one
                        return {
                            ...scheme,
                            key: scheme.type || `auth_scheme_${index}`
                        };
                    }
                    return scheme;
                });
            }
        }

        // Parse the preprocessed IR
        const parsedIR = IrSerialization.IntermediateRepresentation.parse(irJson, {
            unrecognizedObjectKeys: "passthrough",
            allowUnrecognizedEnumValues: true,
            allowUnrecognizedUnionMembers: true
        });

        if (!parsedIR.ok) {
            throw new Error(`Failed to parse IR from ${irFilepath}: ${JSON.stringify(parsedIR.errors, null, 4)}`);
        }

        return parsedIR.value;
    }
}
