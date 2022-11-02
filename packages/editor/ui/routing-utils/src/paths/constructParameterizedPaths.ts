import { constructPaths, Paths } from "./constructPaths";

export type ParameterizedPaths<Prefix extends string, Parameter extends string> = Paths<
    Prefix,
    RelativePathOfParameter<Parameter>
> &
    Record<Parameter, Parameter>;

export function constructParameterizedPaths<Prefix extends string, Parameter extends string>({
    prefix,
    parameter,
}: ConstructParameterizedPathArgs<Prefix, Parameter>): ParameterizedPaths<Prefix, Parameter> {
    const relativePath: RelativePathOfParameter<Parameter> = `:${parameter}`;

    const parameters = {
        [parameter]: parameter,
    } as Record<Parameter, Parameter>;

    return {
        ...constructPaths({ prefix, relativePath }),
        ...parameters,
    };
}

interface ConstructParameterizedPathArgs<Prefix extends string, Parameter extends string> {
    prefix: Prefix;
    parameter: Parameter;
}

type RelativePathOfParameter<Parameter extends string> = `:${Parameter}`;
