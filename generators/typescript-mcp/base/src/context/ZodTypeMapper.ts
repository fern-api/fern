import { TypescriptCustomConfigSchema } from "@fern-api/typescript-ast";

import {
    ContainerType,
    HttpEndpoint,
    HttpPathPart,
    Literal,
    MapType,
    Name,
    NamedType,
    PrimitiveTypeV1,
    SdkRequestWrapper,
    SingleUnionType,
    TypeReference
} from "@fern-fern/ir-sdk/api";

import { AbstractTypescriptMcpGeneratorContext } from "./AbstractTypescriptMcpGeneratorContext";

export declare namespace ZodTypeMapper {
    interface Args {
        reference: TypeReference;
    }
}

export class ZodTypeMapper {
    private context: AbstractTypescriptMcpGeneratorContext<TypescriptCustomConfigSchema>;

    constructor(context: AbstractTypescriptMcpGeneratorContext<TypescriptCustomConfigSchema>) {
        this.context = context;
    }

    // TODO: finish implementing this
    public convert({ reference }: ZodTypeMapper.Args): string {
        return reference._visit({
            container: (value) => this.convertContainer(value),
            named: (value) => this.convertNamed(value),
            primitive: (value) => this.convertPrimitiveTypeV1(value.v1),
            unknown: () => "z.unknown()",
            _other: (value) => "z.any()"
        });
    }

    // TODO: finish implementing this
    public convertEndpoint(endpoint: HttpEndpoint): string {
        return (
            endpoint.sdkRequest?.shape._visit({
                justRequestBody: (value) =>
                    value._visit({
                        typeReference: (value) => this.convert({ reference: value.requestBodyType }),
                        bytes: (value) => "z.any()",
                        _other: (value) => "z.any()"
                    }),
                wrapper: (value) => this.convertWrapper(endpoint, value),
                _other: (value) => "z.any()"
            }) ?? "z.any()"
        );
    }

    // TODO: finish implementing this
    public convertWrapper(endpoint: HttpEndpoint, sdkRequestWrapper: SdkRequestWrapper): string {
        // sdkRequestWrapper.bodyKey
        const bodyProperties =
            endpoint.requestBody?.type === "inlinedRequestBody"
                ? endpoint.requestBody.properties.reduce(
                      (acc, property) => {
                          acc[property.name.name.snakeCase.safeName] = this.convert({ reference: property.valueType });
                          return acc;
                      },
                      {} as Record<string, string>
                  )
                : {};
        const extendedProperties =
            endpoint.requestBody?.type === "inlinedRequestBody"
                ? endpoint.requestBody.extendedProperties?.reduce(
                      (acc, property) => {
                          acc[property.name.name.snakeCase.safeName] = this.convert({ reference: property.valueType });
                          return acc;
                      },
                      {} as Record<string, string>
                  )
                : {};
        // sdkRequestWrapper.includePathParameters
        // sdkRequestWrapper.onlyPathParameters
        const pathParameters = endpoint.allPathParameters.reduce(
            (acc, pathParameter) => {
                acc[pathParameter.name.snakeCase.safeName] = this.convert({ reference: pathParameter.valueType });
                return acc;
            },
            {} as Record<string, string>
        );
        const queryParameters = endpoint.queryParameters.reduce(
            (acc, queryParameter) => {
                acc[queryParameter.name.name.snakeCase.safeName] = this.convert({
                    reference: queryParameter.valueType
                });
                return acc;
            },
            {} as Record<string, string>
        );
        // sdkRequestWrapper.wrapperName
        return `z.object({
            ${Object.entries({ ...bodyProperties, ...extendedProperties, ...pathParameters, ...queryParameters })
                .map(([key, value]) => `${key}: ${value}`)
                .join(",\n")}
        })`;
    }

    // TODO: finish implementing this
    public convertContainer(container: ContainerType): string {
        return container._visit({
            list: (value) => `${this.convert({ reference: value })}.array()`,
            map: (value) => this.convertMap(value),
            nullable: (value) => `${this.convert({ reference: value })}.nullable()`,
            optional: (value) => `${this.convert({ reference: value })}.optional()`,
            set: (value) => this.convert({ reference: value }), // TODO:
            literal: (value) => this.convertLiteral(value),
            _other: (value) => "z.any()"
        });
    }

    // TODO: finish implementing this
    public convertMap(map: MapType): string {
        return `z.record(${this.convert({ reference: map.keyType })}, ${this.convert({ reference: map.valueType })})`;
    }

    // TODO: finish implementing this
    public convertLiteral(literal: Literal): string {
        return literal._visit({
            string: (value) => `z.literal("${value}")`,
            boolean: (value) => `z.literal(${value})`,
            _other: () => "z.any()"
        });
    }

    // TODO: finish implementing this
    public convertNamed(named: NamedType): string {
        return `schemas.${named.name.pascalCase.safeName}`;
    }

    public HACKExtractNamed(type: string): string[] {
        const matches = type.match(/schemas\.([A-Za-z0-9_]+)[.,\n]/g) ?? [];
        return matches.map((match) => match.replace(/schemas\./, "").replace(/[.,]$/, ""));
    }

    // TODO: finish implementing this
    public convertPrimitiveTypeV1(primitiveTypeV1: PrimitiveTypeV1): string {
        return PrimitiveTypeV1._visit(primitiveTypeV1, {
            integer: () => "z.number()",
            long: () => "z.number()",
            uint: () => "z.number()",
            uint64: () => "z.number()",
            float: () => "z.number()",
            double: () => "z.number()",
            boolean: () => "z.boolean()",
            string: () => "z.string()",
            date: () => "z.date()",
            dateTime: () => "z.string().datetime()",
            uuid: () => "z.string().uuid()",
            base64: () => "z.string().base64()",
            bigInteger: () => "z.bigint()",
            _other: () => "z.any()"
        });
    }

    // TODO: finish implementing this
    public convertSingleUnionType(singleUnionType: SingleUnionType): string {
        return singleUnionType.shape._visit({
            samePropertiesAsObject: (value) => "z.any()",
            singleProperty: (value) => "z.any()",
            noProperties: () => "z.any()",
            _other: (value) => "z.any()"
        });
    }

    // TODO: finish implementing this
    public convertHttpPathPart(httpPathPart: HttpPathPart): string {
        return "z.string()";
    }
}
