import { getCommonPrefix } from "@fern-api/core-utils";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { RawSchemas } from "@fern-api/yaml-schema";
import { createHash } from "crypto";
import { startCase } from "lodash-es";
import path from "path";
import { FernDefinition } from "./FernDefnitionBuilder";

function hash(obj: unknown): string {
    const hash = createHash("sha256");
    hash.update(JSON.stringify(obj));
    return hash.digest("hex");
}

export interface DedupedTypeDeclarationSchema {
    name: string;
    location: RelativeFilePath;
    schema: RawSchemas.TypeDeclarationSchema;
    replaces: SchemaToReplace[];
}

interface SchemaToReplace {
    name: string;
    location: RelativeFilePath;
}

interface CandidateSchema {
    name: string;
    location: RelativeFilePath;
    schema: RawSchemas.TypeDeclarationSchema;
}

export class TypeDeclarationSchemaDeduper {
    private hashToSchema: Record<string, CandidateSchema[]> = {};

    public registerSchema({
        name,
        schema,
        location
    }: {
        name: string;
        schema: RawSchemas.TypeDeclarationSchema;
        location: RelativeFilePath;
    }): void {
        const h = hash(schema);
        if (this.hashToSchema[h] == null) {
            this.hashToSchema[h] = [];
        }
        this.hashToSchema[h]?.push({
            name,
            schema,
            location
        });
    }

    /**
     * Computes schemas that can be deduped.
     * @returns
     */
    public dedupe(definition: FernDefinition): FernDefinition {
        const schemasToDedupe = this.computeSchemasToDedupe(definition);

        return definition;
    }

    private computeSchemasToDedupe(definition: FernDefinition): DedupedTypeDeclarationSchema[] {
        const definitionUtility = new FernDefinitionUtility(definition);

        const result: DedupedTypeDeclarationSchema[] = [];

        for (const [_, schemas] of Object.entries(this.hashToSchema)) {
            if (schemas[0] == null) {
                continue;
            }

            if (schemas.length <= 1) {
                continue;
            }

            let location = RelativeFilePath.of("__package__.yml");
            const filepaths = schemas.map((candidate) => candidate.location);
            const prefix = getCommonPrefix(filepaths);
            const splitPrefix = prefix.split("/").slice(0, prefix.length - 1);
            if (splitPrefix.length > 0) {
                let joinedPrefix = splitPrefix.join("/");
                if (!joinedPrefix.endsWith(".yml")) {
                    joinedPrefix += "/__package__.yml";
                }
                location = RelativeFilePath.of(joinedPrefix);
            }

            const names: string[] = [];
            for (const schema of schemas) {
                const tokens = splitByCaps(schema.name);

                let name = undefined;
                for (let i = tokens.length - 1; i > 0; --i) {
                    const candidateType = tokens.slice(0, i).join("");
                    const candidateTypeExists = definitionUtility.doesTypeExist({
                        type: candidateType
                    });
                    if (candidateTypeExists) {
                        name = schema.name === candidateType ? candidateType : tokens.slice(i).join("");
                        break;
                    }
                }

                if (name != null) {
                    names.push(name);
                }
            }

            if (!areAllStringsEqual(names) && names[0] != null) {
                continue;
            }

            result.push({
                name: startCase(names[0]),
                location,
                schema: schemas[0].schema,
                replaces: schemas.map((schema) => {
                    return {
                        location: schema.location,
                        name: schema.name
                    };
                })
            });
        }

        return result;
    }
}

/**
 * Utility to ask about the generated fern definition
 */
class FernDefinitionUtility {
    private allTypes: Set<string> = new Set();
    private rootPackageTypes: Set<string> = new Set();
    private nestedPackageTypes: Record<string, Set<string>> = {};

    public constructor(definition: FernDefinition) {
        for (const [_, definitionFileSchema] of Object.entries(definition.definitionFiles)) {
            Object.keys(definitionFileSchema.types ?? {}).forEach((key) => {
                this.allTypes.add(key);
            });
            Object.values(definitionFileSchema.service?.endpoints ?? {}).forEach((endpoint) => {
                if (typeof endpoint.request === "object" && endpoint.request?.name != null) {
                    this.allTypes.add(endpoint.request.name);
                }
            });
        }
        Object.keys(definition.packageMarkerFile.types ?? {}).forEach((key) => {
            this.allTypes.add(key);
        });
        Object.values(definition.packageMarkerFile.service?.endpoints ?? {}).forEach((endpoint) => {
            if (typeof endpoint.request === "object" && endpoint.request?.name != null) {
                this.allTypes.add(endpoint.request.name);
            }
        });
    }

    public doesTypeExist({ type }: { type: string }): boolean {
        return this.allTypes.has(type);
    }

    public doesTypeExistInPackage({ type, package }: { type: string; package: string }): boolean {}
}

function splitByCaps(inputString: string): string[] {
    // Use regular expression to split by capital letters
    const result = inputString.match(/[A-Z][a-z]*/g) || [];
    return result;
}

function areAllStringsEqual(strings: string[]): boolean {
    // Check if all elements in the array are equal to the first element
    return strings.every((str, _, array) => str === array[0]);
}
