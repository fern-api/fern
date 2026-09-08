import { assertNever } from "@fern-api/core-utils";
import { ruby } from "@fern-api/ruby-ast";
import { FernIr } from "@fern-fern/ir-sdk";
import { SdkGeneratorContext } from "../../SdkGeneratorContext.js";

/**
 * Builds the Ruby expression that turns a successful JSON response body into the
 * endpoint's return value. An empty body yields `nil`. Named types deserialize via
 * `.load`; containers (lists, maps, sets) are parsed and coerced element-wise;
 * primitives and unknown bodies are parsed as-is.
 *
 * Map bodies are parsed with string keys so that `map<integer, T>` (and other
 * non-string key types) can be coerced from the JSON object keys; everything else is
 * parsed with `symbolize_names: true` to match `Model.load`.
 */
export function responseBodyLoader({
    context,
    typeReference,
    responseVariableName
}: {
    context: SdkGeneratorContext;
    typeReference: FernIr.TypeReference;
    responseVariableName: string;
}): ruby.AstNode {
    const body = `${responseVariableName}.body`;
    const guard = (expression: string): string => `(${body}.to_s.empty? ? nil : ${expression})`;
    const parseExpression = (symbolizeNames: boolean): string =>
        symbolizeNames ? `JSON.parse(${body}, symbolize_names: true)` : `JSON.parse(${body})`;

    return ruby.codeblock((writer) => {
        switch (typeReference.type) {
            case "named":
                writer.write(`(${body}.to_s.empty? ? nil : `);
                writer.writeNode(context.getReferenceToTypeId(typeReference.typeId));
                writer.write(`.load(${body}))`);
                return;
            case "container": {
                const rubyType = context.typeMapper.convert({ reference: typeReference, unboxOptionals: true });
                const symbolizeNames = typeReference.container.type !== "map";
                writer.write(`${context.getRootModuleName()}::Internal::Types::Utils.coerce(`);
                writer.writeNode(rubyType);
                writer.write(`, ${guard(parseExpression(symbolizeNames))})`);
                return;
            }
            case "primitive":
            case "unknown":
                writer.write(guard(parseExpression(true)));
                return;
            default:
                assertNever(typeReference);
        }
    });
}
