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
 * Bodies are parsed with `symbolize_names: true` to match `Model.load`, so that an
 * `unknown` value reaches the caller symbol-keyed wherever it appears. The one exception
 * is a map whose keys coerce to `Integer`: JSON object keys are always strings, and
 * `Utils.coerce(Integer, :"1")` cannot convert a Symbol, so those bodies are parsed with
 * string keys instead. `String`/`Symbol`/enum keys round-trip from either form.
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
                const symbolizeNames = !mapKeysMustStayStrings({ context, container: typeReference.container });
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

/**
 * True when a map's JSON object keys have to reach `Utils.coerce` as `String`s.
 *
 * The decision is made on the *resolved* Ruby key type rather than the IR primitive so
 * that aliases (`map<MyIntAlias, T>`) follow the same rule as the primitive they resolve
 * to, and so it stays in lockstep with what `Internal::Types::Hash#coerce` receives.
 * `Utils.coerce` converts a `String` key to `Symbol`/`String`/`Integer` alike, but has no
 * `Symbol -> Integer` path, so `Integer` keys are the only ones that cannot round-trip
 * from `symbolize_names: true`.
 */
function mapKeysMustStayStrings({
    context,
    container
}: {
    context: SdkGeneratorContext;
    container: FernIr.ContainerType;
}): boolean {
    if (container.type !== "map") {
        return false;
    }
    const keyType = context.typeMapper.convert({ reference: container.keyType });
    return keyType.internalType?.type === "integer";
}
