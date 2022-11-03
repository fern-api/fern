export interface Path<AbsolutePath extends string, Parameters = Record<string, never>> {
    readonly absolutePath: AbsolutePath;
    readonly parameters: Parameters;
    readonly addPath: <NewPath extends string>(path: NewPath) => Path<`${AbsolutePath}/${NewPath}`, Parameters>;
    readonly addParameter: <Parameter extends string>(
        parameter: Parameter
    ) => Path<`${AbsolutePath}/:${Parameter}`, Parameters & Record<Parameter, Parameter>>;
}

export const ROOT_PATH = constructPath("", {});

function constructPath<AbsolutePath extends string, Parameters = Record<string, never>>(
    absolutePath: AbsolutePath,
    parameters: Parameters
): Path<AbsolutePath, Parameters> {
    return {
        absolutePath,
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
        parameters,
    };
}
