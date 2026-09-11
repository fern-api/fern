import { assertNever } from "@fern-api/core-utils";
import { ruby } from "@fern-api/ruby-ast";
import { FernIr } from "@fern-fern/ir-sdk";
import { SdkGeneratorContext } from "../../SdkGeneratorContext.js";

/**
 * Builds the Ruby expression that turns a successful JSON response body into the
 * endpoint's return value. An empty body yields `nil`. Named types deserialize via
 * `.load`, including through `optional`/`nullable` wrappers; containers (lists, maps,
 * sets) are parsed and coerced element-wise; primitives and unknown bodies are parsed
 * as-is.
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
    const reference = unwrapOptionalNamed({ context, reference: typeReference });

    return ruby.codeblock((writer) => {
        switch (reference.type) {
            case "named":
                writer.write(`(${body}.to_s.empty? ? nil : `);
                writer.writeNode(context.getReferenceToTypeId(reference.typeId));
                writer.write(`.load(${body}))`);
                return;
            case "container": {
                const rubyType = context.typeMapper.convert({ reference, unboxOptionals: true });
                const symbolizeNames = !mapKeysMustStayStrings({ context, container: reference.container });
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
                assertNever(reference);
        }
    });
}

/**
 * Unwraps `optional`/`nullable` wrappers when they bottom out at a named type, so that
 * `optional<MyUnion>` deserializes the same way a bare `MyUnion` does.
 *
 * The container branch would otherwise hand the named type to `Utils.coerce`, which
 * cannot resolve a union member for a `Model` subclass that extends `Union`: the
 * `t <= Model` pattern matches first and returns any non-`Hash` body untouched, so a
 * `list<Foo>` union member arrives as raw parsed JSON instead of `Foo` instances.
 *
 * Wrappers around anything else (`optional<list<T>>`, `optional<string>`) keep falling
 * through to the existing branches, which already unbox optionals themselves.
 *
 * Aliases are excluded: an alias generates a module whose `.load` is a bare `JSON.parse`,
 * so unwrapping `optional<MyAlias>` onto the named branch would drop the coercion the
 * container branch gets for free by resolving the alias to its underlying type.
 */
function unwrapOptionalNamed({
    context,
    reference
}: {
    context: SdkGeneratorContext;
    reference: FernIr.TypeReference;
}): FernIr.TypeReference {
    if (reference.type !== "container") {
        return reference;
    }
    const inner =
        reference.container.type === "optional"
            ? reference.container.optional
            : reference.container.type === "nullable"
              ? reference.container.nullable
              : undefined;
    if (inner == null) {
        return reference;
    }
    const unwrapped = unwrapOptionalNamed({ context, reference: inner });
    if (unwrapped.type !== "named") {
        return reference;
    }
    return context.getTypeDeclarationOrThrow(unwrapped.typeId).shape.type === "alias" ? reference : unwrapped;
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
