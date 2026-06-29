/**
 * Computes a GraphQL operation's result type from the caller's field selection `S`, narrowing the
 * full model `T` down to exactly the fields that were selected. Fields that were not selected are
 * ABSENT from the result type (not present-but-`undefined`), so the type matches the JSON the server
 * actually returns for the operation's query.
 *
 * This mirrors the genql/Zeus selection-inference model and is paired with the generated `<Type>Select`
 * interfaces: a method takes `selection: S extends <Type>Select` and returns `Result<<Type>, S>`.
 *
 * Conventions this type is built around (matching the generated models):
 * - Nullable GraphQL fields are emitted as optional `field?: X | undefined` (never `| null`); a
 *   selected nullable field keeps its `X | undefined`.
 * - Scalars (including branded custom scalars like `DateTime`) are passed through opaquely when
 *   selected with `true`.
 * - The reserved selection keys `__args` (field arguments), `__on` (inline fragments on a
 *   union/interface) and `__typename` are handled specially and never treated as model fields.
 */

/** Reserved selection keys that never correspond to a model field. */
export type GraphqlResultMetaKey = "__args" | "__on" | "__typename";

/** True when, after stripping the reserved meta keys, `S` still selects at least one real field. */
type GraphqlHasRealFields<S> = keyof Omit<S, GraphqlResultMetaKey> extends never ? false : true;

/**
 * Result of selecting a single model field of type `V` with selection value `SV`.
 * - `SV extends true` → the field is a selected scalar/branded-scalar/enum and is passed through.
 * - `V` is an array → distribute `Result` over the element type, re-applying the field's optionality.
 * - `SV` is an object that selects real fields → recurse into the (non-null) object, re-applying
 *   the field's optionality.
 * - `SV` is an object that only carries meta keys (e.g. a scalar field selected with `__args`) → pass
 *   the scalar through.
 */
type GraphqlResultField<V, SV> = SV extends true
    ? V
    : [NonNullable<V>] extends [ReadonlyArray<infer U>]
      ? Result<U, SV>[] | (undefined extends V ? undefined : never)
      : SV extends object
        ? GraphqlHasRealFields<SV> extends true
            ? Result<NonNullable<V>, SV> | (undefined extends V ? undefined : never)
            : V
        : V;

/**
 * The result of selecting fields `S` on a (non-polymorphic) object model `T`. Only keys of `S` that
 * are truthy and that exist on `T` survive; reserved meta keys are dropped. The optionality of each
 * surviving field is recomputed by {@link GraphqlResultField} from the model field type, so a selected
 * nullable field stays `X | undefined`.
 */
type GraphqlObjectResult<T, S> = {
    [K in keyof S as K extends GraphqlResultMetaKey
        ? never
        : S[K] extends false | undefined
          ? never
          : K extends keyof NonNullable<T>
            ? K
            : never]: K extends keyof NonNullable<T> ? GraphqlResultField<NonNullable<T>[K], S[K]> : never;
};

/** `{ __typename: string }` iff the selection requested `__typename`, otherwise contributes nothing. */
type GraphqlTypenameResult<S> = "__typename" extends keyof S
    ? S["__typename"] extends true
        ? { __typename: string }
        : unknown
    : unknown;

/**
 * True when a model field type `V` is a scalar leaf (passed through by `__all`), false when it is a
 * selectable object. Detection is by primitive-assignability rather than `extends object`, because a
 * branded custom scalar (e.g. `DateTime = string & { __brand }`) IS assignable to `object` and would
 * be misclassified. Order matters: `unknown`/JSON first, then arrays distribute over their element,
 * then primitives/branded-primitives/enums; anything else is an object.
 */
type GraphqlIsScalarField<V> = unknown extends V
    ? true
    : [NonNullable<V>] extends [ReadonlyArray<infer U>]
      ? GraphqlIsScalarField<U>
      : [NonNullable<V>] extends [string | number | boolean | bigint]
        ? true
        : false;

/** Picks every scalar leaf field of `T` (the `__all` expansion), preserving each field's optionality. */
type GraphqlAllScalarsResult<T> = {
    [K in keyof T as GraphqlIsScalarField<T[K]> extends true ? K : never]: T[K];
};

/**
 * The `__all` contribution: when the selection sets `__all: true`, every scalar leaf field of the
 * (non-null) model is included; otherwise it contributes nothing. Object relations are never pulled in
 * by `__all` — those must still be selected explicitly.
 */
type GraphqlAllResult<T, S> = "__all" extends keyof S
    ? S["__all"] extends true
        ? GraphqlAllScalarsResult<NonNullable<T>>
        : unknown
    : unknown;

/**
 * For a concrete union/interface member `T`, builds one result per `__on` entry whose member-selection
 * structurally matches `T` (its selected fields are keys of `T`). Each member result combines the
 * member-specific selection, any commonly-selected fields, and the requested `__typename`. The map is
 * then indexed to collapse to a union of the matching member results.
 */
type GraphqlMemberResultMap<T, S, On> = {
    [M in keyof On as keyof Omit<NonNullable<On[M]>, GraphqlResultMetaKey> extends keyof NonNullable<T>
        ? M
        : never]: GraphqlObjectResult<T, NonNullable<On[M]>> &
        GraphqlObjectResult<T, Omit<S, "__on">> &
        GraphqlTypenameResult<S>;
};

type GraphqlMemberResult<T, S, On> = GraphqlMemberResultMap<T, S, On>[keyof GraphqlMemberResultMap<T, S, On>];

/**
 * Result of a selection that uses `__on` (inline fragments on a union/interface-typed value). The
 * model `T` is a union of the possible concrete types; we distribute over it (`T extends unknown`) so
 * each concrete member yields its own per-member result, producing a discriminated union of
 * `Result<Member, MemberSelect>` rather than a merged object.
 */
type GraphqlPolymorphicResult<T, S> = S extends { __on?: infer On }
    ? T extends unknown
        ? GraphqlMemberResult<T, S, NonNullable<On>>
        : never
    : GraphqlObjectResult<T, S>;

/**
 * Narrows the model `T` to exactly the fields selected by `S`.
 * - An array model distributes: `Result<U, S>[]` (re-applying an outer `| undefined`).
 * - A selection that uses `__on` produces a discriminated union of per-member results.
 * - Any other selection produces a single narrowed object.
 */
export type Result<T, S> = [NonNullable<T>] extends [ReadonlyArray<infer U>]
    ? Result<U, S>[] | (undefined extends T ? undefined : never)
    : S extends { __on?: object }
      ? GraphqlPolymorphicResult<T, S>
      : GraphqlObjectResult<T, S> & GraphqlTypenameResult<S> & GraphqlAllResult<T, S>;
