import { visitDiscriminatedUnion } from "@fern-api/core-utils";
import { TypescriptCustomConfigSchema } from "@fern-api/typescript-ast";

import { PrimitiveTypeV1, SdkRequest, SingleUnionType, TypeReference } from "@fern-fern/ir-sdk/api";

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
        return visitDiscriminatedUnion(reference)._visit({
            container: (value) => "any",
            named: (value) => "any",
            primitive: (value) => this.convertPrimitiveTypeV1(value.v1),
            unknown: () => "unknown",
            _other: (value) => "any"
        });
    }

    // TODO: finish implementing this
    public convertSdkRequest(sdkRequest: SdkRequest): string {
        return sdkRequest?.shape
            ? visitDiscriminatedUnion(sdkRequest.shape)._visit({
                  justRequestBody: (value) =>
                      visitDiscriminatedUnion(value)._visit({
                          typeReference: (value) =>
                              visitDiscriminatedUnion(value.requestBodyType)._visit({
                                  container: (value) => "any",
                                  named: (value) => {
                                      const { name: schemaName, fernFilepath: schemaFilepath } = value;
                                      return this.context.project.builder.getSchemaVariableName(
                                          schemaName,
                                          schemaFilepath
                                      );
                                  },
                                  primitive: (value) => this.convertPrimitiveTypeV1(value.v1),
                                  unknown: () => "unknown",
                                  _other: (value) => "any"
                              }),
                          bytes: (value) => "any",
                          _other: (value) => "any"
                      }),
                  wrapper: (value) => "any",
                  _other: (value) => "any"
              })
            : "any";
    }

    // TODO: finish implementing this
    public convertPrimitiveTypeV1(primitiveTypeV1: PrimitiveTypeV1): string {
        return PrimitiveTypeV1._visit(primitiveTypeV1, {
            integer: () => "number",
            long: () => "number",
            uint: () => "number",
            uint64: () => "number",
            float: () => "number",
            double: () => "number",
            boolean: () => "boolean",
            string: () => "string",
            date: () => "date",
            dateTime: () => "string().datetime",
            uuid: () => "string().uuid",
            base64: () => "string().base64",
            bigInteger: () => "bigint",
            _other: () => "any"
        });
    }

    // TODO: finish implementing this
    public convertSingleUnionType(singleUnionType: SingleUnionType): string {
        return visitDiscriminatedUnion(singleUnionType.shape)._visit({
            samePropertiesAsObject: (value) => "any",
            singleProperty: (value) => "any",
            noProperties: () => "any",
            _other: (value) => "any"
        });
    }
}
