export type DiscriminatedUnionVisitor<T extends Record<Discriminant, string>, U, Discriminant extends string> = {
    [D in T[Discriminant]]: (value: Extract<T, Record<Discriminant, D>>) => U;
} & {
    _other: (value: Record<Discriminant, string>) => U;
};

export function visitDiscriminatedUnion<T extends Record<Discriminant, string>, Discriminant extends string>(
    item: T,
    discriminant: Discriminant
): { _visit: <U>(visitor: DiscriminatedUnionVisitor<T, U, Discriminant>) => U } {
    return {
        _visit: (visitor) => {
            const visit = visitor[item[discriminant]];
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (visit != null) {
                return visit(item as Extract<T, Record<Discriminant, string>>);
            } else {
                return visitor._other(item);
            }
        }
    };
}
