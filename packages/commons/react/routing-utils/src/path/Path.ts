export interface Path<AbsolutePath extends string, Parameters = Record<string, never>> {
    readonly absolutePath: AbsolutePath;
    readonly parameters: Parameters;
    readonly addPath: <NewPath extends string>(path: NewPath) => Path<`${AbsolutePath}/${NewPath}`, Parameters>;
    readonly addParameter: <Parameter extends string>(
        parameter: Parameter
    ) => Path<`${AbsolutePath}/:${Parameter}`, Parameters & Record<Parameter, Parameter>>;
    readonly addSplat: () => Path<`${AbsolutePath}/*`, Parameters & Record<"*", "*">>;
    readonly join: <OtherPath extends string, OtherParameters>(
        suffix: Path<OtherPath, OtherParameters>
    ) => Path<`${AbsolutePath}${OtherPath}`, Parameters & OtherParameters>;
}

export const ROOT_PATH = constructPath("", {});

function constructPath<AbsolutePath extends string, Parameters = Record<string, never>>(
    absolutePath: AbsolutePath,
    parameters: Parameters
): Path<AbsolutePath, Parameters> {
    return {
        absolutePath,
        parameters,
        addPath: (newPath) => constructPath(`${absolutePath}/${newPath}`, parameters),
        addParameter: <Parameter extends string>(parameter: Parameter) => {
            const newParametersMap = {
                [parameter]: parameter,
            } as Record<Parameter, Parameter>;
            return constructPath(`${absolutePath}/:${parameter}`, {
                ...parameters,
                ...newParametersMap,
            });
        },
        addSplat: () =>
            constructPath(`${absolutePath}/*`, {
                ...parameters,
                "*": "*",
            }),
        join: (otherPath) =>
            constructPath(`${absolutePath}${otherPath.absolutePath}`, {
                ...parameters,
                ...otherPath.parameters,
            }),
    };
}
