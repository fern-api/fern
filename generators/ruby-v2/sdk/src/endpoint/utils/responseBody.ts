import { assertNever } from "@fern-api/core-utils";
import { ruby } from "@fern-api/ruby-ast";
import { FernIr } from "@fern-fern/ir-sdk";

export interface ResponseBodyLoaderArgs {
    typeReference: FernIr.TypeReference;
    responseVariableName: string;
    rootModuleName: string;
    getReferenceToTypeId: (typeId: FernIr.TypeId) => ruby.ClassReference;
    getRubyType: (typeReference: FernIr.TypeReference) => ruby.Type;
}

/**
 * Builds the Ruby expression that turns a successful JSON response body into the
 * endpoint's return value. Named types deserialize via `.load`; containers (lists,
 * maps, sets) are parsed and coerced element-wise; primitives and unknown bodies are
 * parsed as-is.
 */
export function responseBodyLoader({
    typeReference,
    responseVariableName,
    rootModuleName,
    getReferenceToTypeId,
    getRubyType
}: ResponseBodyLoaderArgs): ruby.AstNode {
    const parseExpression = `(${responseVariableName}.body.to_s.empty? ? nil : JSON.parse(${responseVariableName}.body, symbolize_names: true))`;
    return ruby.codeblock((writer) => {
        switch (typeReference.type) {
            case "named":
                writer.writeNode(getReferenceToTypeId(typeReference.typeId));
                writer.write(`.load(${responseVariableName}.body)`);
                return;
            case "container":
                writer.write(`${rootModuleName}::Internal::Types::Utils.coerce(`);
                writer.writeNode(getRubyType(typeReference));
                writer.write(`, ${parseExpression})`);
                return;
            case "primitive":
            case "unknown":
                writer.write(parseExpression);
                return;
            default:
                assertNever(typeReference);
        }
    });
}
