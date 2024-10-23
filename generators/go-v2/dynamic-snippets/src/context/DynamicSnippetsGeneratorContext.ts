import { FernGeneratorExec } from "@fern-api/generator-commons";
import { BaseGoCustomConfigSchema, resolveRootImportPath } from "@fern-api/go-codegen";
import { FernFilepath, dynamic as DynamicSnippets, TypeId } from "@fern-fern/ir-sdk/api";
import { HttpEndpointReferenceParser } from "@fern-api/fern-definition-schema";
import { TypeInstance } from "../TypeInstance";
import { DynamicTypeMapper } from "./DynamicTypeMapper";
import path from "path";

export class DynamicSnippetsGeneratorContext {
    public ir: DynamicSnippets.DynamicIntermediateRepresentation;
    public config: FernGeneratorExec.config.GeneratorConfig;
    public customConfig: BaseGoCustomConfigSchema;
    public dynamicTypeMapper: DynamicTypeMapper;
    public rootImportPath: string;

    private httpEndpointReferenceParser: HttpEndpointReferenceParser;

    constructor({
        ir,
        config
    }: {
        ir: DynamicSnippets.DynamicIntermediateRepresentation;
        config: FernGeneratorExec.config.GeneratorConfig;
    }) {
        this.ir = ir;
        this.config = config;
        this.customConfig = config.customConfig as BaseGoCustomConfigSchema;
        this.dynamicTypeMapper = new DynamicTypeMapper({ context: this });
        this.rootImportPath = resolveRootImportPath({ config, customConfig: this.customConfig });
        this.httpEndpointReferenceParser = new HttpEndpointReferenceParser();
    }

    public associateByWireValue({
        parameters,
        values
    }: {
        parameters: DynamicSnippets.NamedParameter[];
        values: DynamicSnippets.Values;
    }): TypeInstance[] {
        const instances: TypeInstance[] = [];
        for (const [key, value] of Object.entries(values)) {
            const parameter = parameters.find((param) => param.name.wireValue === key);
            if (parameter == null) {
                throw new Error(`"${key}" is not a recognized parameter for this endpoint`);
            }
            instances.push({
                name: parameter.name.name,
                typeReference: parameter.typeReference,
                value
            });
        }
        return instances;
    }

    public getRecordOrThrow(value: unknown): Record<string, unknown> {
        if (typeof value === "object" && value != null) {
            return value as Record<string, unknown>;
        }
        throw new Error(`Expected object with key, value pairs but got: ${JSON.stringify(value)}`);
    }

    public resolveNamedTypeOrThrow({ typeId }: { typeId: TypeId }): DynamicSnippets.NamedType {
        const namedType = this.ir.types[typeId];
        if (namedType == null) {
            throw new Error(`Type identified by "${typeId}" could not be found`);
        }
        return namedType;
    }

    public resolveDiscriminatedUnionTypeOrThrow({
        discriminatedUnion,
        value
    }: {
        discriminatedUnion: DynamicSnippets.DiscriminatedUnionType;
        value: unknown;
    }): { typeReference: DynamicSnippets.TypeReference; value: unknown } {
        const record = this.getRecordOrThrow(value);

        const discriminant = record[discriminatedUnion.discriminant.wireValue];
        if (discriminant == null) {
            throw new Error(
                `Missing required discriminant field "${
                    discriminatedUnion.discriminant.wireValue
                }" got ${JSON.stringify(value)}`
            );
        }
        if (typeof discriminant !== "string") {
            throw new Error(`Expected discriminant value to be a string but got: ${JSON.stringify(discriminant)}`);
        }

        // TODO: Convert the DiscriminatedUnionType into a TypeReference.
        const typeReference = discriminatedUnion.types[discriminant];
        if (typeReference == null) {
            throw new Error(`No type found for discriminant value "${discriminant}"`);
        }

        // Remove the discriminant from the record so that the value is valid for the type.
        const { [discriminant]: _, ...filtered } = record;
        return {
            typeReference: this.convertSingleDiscriminatedUnionTypeToTypeReference(typeReference),
            value: filtered
        };
    }

    public getImportPath(fernFilepath: FernFilepath): string {
        const parts = fernFilepath.packagePath.map((path) => path.pascalCase.unsafeName.toLowerCase());
        return [this.rootImportPath, ...parts].join("/");
    }

    public getClientImportPath(): string {
        return path.join(this.rootImportPath, "client");
    }

    public getOptionImportPath(): string {
        return path.join(this.rootImportPath, "option");
    }

    public resolveEndpointOrThrow(rawEndpoint: string): DynamicSnippets.Endpoint {
        const parsedEndpoint = this.httpEndpointReferenceParser.tryParse(rawEndpoint);
        if (parsedEndpoint == null) {
            throw new Error(`Failed to parse endpoint reference "${rawEndpoint}"`);
        }
        return this.resolveEndpointLocationOrThrow(parsedEndpoint);
    }

    public resolveEndpointLocationOrThrow(location: DynamicSnippets.EndpointLocation): DynamicSnippets.Endpoint {
        for (const endpoint of Object.values(this.ir.endpoints)) {
            if (this.parsedEndpointMatches({ endpoint, parsedEndpoint: location })) {
                return endpoint;
            }
        }
        throw new Error(`Failed to find endpoint identified by "${JSON.stringify(location)}"`);
    }

    private convertSingleDiscriminatedUnionTypeToTypeReference(
        singleDiscriminatedUnionType: DynamicSnippets.SingleDiscriminatedUnionType
    ): DynamicSnippets.TypeReference {
        throw new Error("TODO: Implement me!");
    }

    private parsedEndpointMatches({
        endpoint,
        parsedEndpoint
    }: {
        endpoint: DynamicSnippets.Endpoint;
        parsedEndpoint: HttpEndpointReferenceParser.Parsed;
    }): boolean {
        return endpoint.location.method === parsedEndpoint.method && endpoint.location.path === parsedEndpoint.path;
    }
}
