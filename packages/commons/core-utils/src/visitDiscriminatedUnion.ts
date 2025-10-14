import { assertNever } from "./assert";

export type DiscriminatedUnionVisitor<T extends Record<Discriminant, string>, U, Discriminant extends string> = {
    [D in T[Discriminant]]: (value: Extract<T, Record<Discriminant, D>>) => U;
} & {
    _other?: (value: Record<Discriminant, string>) => U;
};

export function visitDiscriminatedUnion<T extends Record<"type", string>>(
    item: T
): { _visit: <U>(visitor: DiscriminatedUnionVisitor<T, U, "type">) => U };
export function visitDiscriminatedUnion<T extends Record<Discriminant, string>, Discriminant extends string>(
    item: T,
    discriminant: Discriminant
): { _visit: <U>(visitor: DiscriminatedUnionVisitor<T, U, Discriminant>) => U };
export function visitDiscriminatedUnion<T extends Record<Discriminant, string>, Discriminant extends string>(
    item: T,
    discriminant: Discriminant = "type" as Discriminant
): { _visit: <U>(visitor: DiscriminatedUnionVisitor<T, U, Discriminant>) => U } {
    return {
        _visit: (visitor) => {
            const visit = visitor[item[discriminant]];
            if (visit != null) {
                return visit(item as Extract<T, Record<Discriminant, string>>);
            } else {
                if (visitor._other == null) {
                    assertNever(item as never);
                }
                return visitor._other(item);
            }
        }
    };
}

export default visitDiscriminatedUnion;
