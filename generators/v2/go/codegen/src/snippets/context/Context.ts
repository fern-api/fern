import { FernGeneratorExec } from "@fern-api/generator-commons";
import { BaseGoCustomConfigSchema } from "../../custom-config/BaseGoCustomConfigSchema";
import {
    DiscriminatedUnionType,
    FernFilepath,
    IntermediateRepresentation,
    NamedParameter,
    Type,
    Values
} from "../generated/api";
import { Instance } from "../Instance";

export class Context {
    public config: FernGeneratorExec.config.GeneratorConfig;
    public customConfig: BaseGoCustomConfigSchema;
    public ir: IntermediateRepresentation;
    public rootImportPath: string;

    constructor({ ir, config }: { ir: IntermediateRepresentation; config: FernGeneratorExec.config.GeneratorConfig }) {
        this.ir = ir;
        this.config = config;
        this.customConfig = config.customConfig as BaseGoCustomConfigSchema;
        this.rootImportPath = this.customConfig.importPath ?? "github.com/acme/acme-go"; // TODO: This value will need to be required.
    }

    public associateByWireValue({ parameters, values }: { parameters: NamedParameter[]; values: Values }): Instance[] {
        const instances: Instance[] = [];
        for (const [key, value] of Object.entries(values)) {
            const parameter = parameters.find((param) => param.name.wireValue === key);
            if (parameter == null) {
                throw new Error(`"${key}" is not a recognized parameter for this endpoint`);
            }
            instances.push({
                name: parameter.name.name,
                type: parameter.type,
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

    public resolveDiscriminatedUnionTypeOrThrow({
        discriminatedUnion,
        value
    }: {
        discriminatedUnion: DiscriminatedUnionType;
        value: unknown;
    }): { type: Type; value: unknown } {
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

        const type = discriminatedUnion.types[discriminant];
        if (type == null) {
            throw new Error(`No type found for discriminant value "${discriminant}"`);
        }

        // Remove the discriminant from the record so that the value is valid for the type.
        const { [discriminant]: _, ...filtered } = record;
        return { type, value: filtered };
    }

    public getImportPath(fernFilepath: FernFilepath): string {
        const parts = fernFilepath.packagePath.map((path) => path.pascalCase.unsafeName.toLowerCase());
        return [this.rootImportPath, ...parts].join("/");
    }
}
