import { OpenAPIV3_1 } from "openapi-types";

import { TypeDeclaration, TypeId, TypeReference } from "@fern-api/ir-sdk";
import { Converters, ErrorCollector } from "@fern-api/v2-importer-commons";

import { OpenAPIConverterContext3_1 } from "../OpenAPIConverterContext3_1";
import { OpenAPIConverter } from "../OpenAPIConverter";

<<<<<<< HEAD
export class ParameterConverter extends Converters.AbstractConverters
    .AbstractParameterConverter<OpenAPIV3_1.ParameterObject> {
    constructor({
        breadcrumbs,
        parameter
    }: Converters.AbstractConverters.AbstractParameterConverter.Args<OpenAPIV3_1.ParameterObject>) {
        super({ breadcrumbs, parameter });
=======
export declare namespace ParameterConverter {
    export interface Args extends OpenAPIConverter.Args {
        parameter: OpenAPIV3_1.ParameterObject;
    }
    export interface BaseParameterOutput {
        inlinedTypes?: Record<TypeId, TypeDeclaration>;
    }

    export interface QueryParameterOutput extends BaseParameterOutput {
        type: "query";
        parameter: QueryParameter;
    }

    export interface HeaderParameterOutput extends BaseParameterOutput {
        type: "header";
        parameter: HttpHeader;
    }

    export interface PathParameterOutput extends BaseParameterOutput {
        type: "path";
        parameter: PathParameter;
    }

    export type Output = QueryParameterOutput | HeaderParameterOutput | PathParameterOutput;
}

export class ParameterConverter extends AbstractConverter<OpenAPIConverterContext3_1, ParameterConverter.Output> {
    public static STRING = TypeReference.primitive({
        v1: "STRING",
        v2: PrimitiveTypeV2.string({
            default: undefined,
            validation: undefined
        })
    });

    public static OPTIONAL_STRING = TypeReference.container(ContainerType.optional(ParameterConverter.STRING));

    private readonly parameter: OpenAPIV3_1.ParameterObject;

    constructor({ context, breadcrumbs, parameter }: ParameterConverter.Args) {
        super({ context, breadcrumbs });
        this.parameter = parameter;
>>>>>>> 524551c8a2 (chore(cli): setup openrpc converter to share getGroup and getOrCreatePackage and removeXFernIgnores)
    }

    public async convert({
        context,
        errorCollector
    }: {
        context: OpenAPIConverterContext3_1;
        errorCollector: ErrorCollector;
    }): Promise<Converters.AbstractConverters.AbstractParameterConverter.Output | undefined> {
        let typeReference: TypeReference | undefined;
        let inlinedTypes: Record<TypeId, TypeDeclaration> = {};

        if (this.parameter.schema != null) {
            const schemaOrReferenceConverter = new Converters.SchemaConverters.SchemaOrReferenceConverter({
                context: this.context,
                breadcrumbs: [...this.breadcrumbs, "schema"],
                schemaOrReference: this.parameter.schema,
                wrapAsOptional: this.parameter.required == null || !this.parameter.required
            });
            const converted = await schemaOrReferenceConverter.convert({ context, errorCollector });
            if (converted != null) {
                typeReference = converted.type;
                inlinedTypes = converted.inlinedTypes ?? {};
            }
        }

        return this.convertToOutput({
            typeReference,
            inlinedTypes,
            context,
            errorCollector
        });
    }
}
