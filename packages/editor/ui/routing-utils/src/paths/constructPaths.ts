export interface Paths<Prefix extends string, Relative extends string> {
    absolutePath: AbsolutePath<Prefix, Relative>;
    relativePath: Relative;
}

export function constructPaths<Prefix extends string, Relative extends string>({
    prefix,
    relativePath,
}: ConstructPathArgs<Prefix, Relative>): Paths<Prefix, Relative> {
    return {
        absolutePath: `${prefix}/${relativePath}`,
        relativePath,
    };
}

interface ConstructPathArgs<Prefix extends string, Relative extends string> {
    prefix: Prefix;
    relativePath: Relative;
}

type AbsolutePath<Prefix extends string, Relative extends string> = `${Prefix}/${Relative}`;
