export interface Path<AbsolutePath extends string, PathParts, Parameters> {
    readonly absolutePath: AbsolutePath;
    readonly pathParts: PathParts;
    readonly parameters: Parameters;
    readonly addPath: <NewPath extends string>(
        path: NewPath
    ) => Path<`${AbsolutePath}/${NewPath}`, PathParts & Record<NewPath, NewPath>, Parameters>;
    readonly addParameter: <Parameter extends string>(
        parameter: Parameter
    ) => Path<`${AbsolutePath}/:${Parameter}`, PathParts, Parameters & Record<Parameter, Parameter>>;
    readonly addSplat: () => Path<`${AbsolutePath}/*`, PathParts, Parameters & Record<"*", "*">>;
    readonly join: <OtherPath extends string, OtherPathParts, OtherParameters>(
        suffix: Path<OtherPath, OtherPathParts, OtherParameters>
    ) => Path<`${AbsolutePath}${OtherPath}`, PathParts & OtherPathParts, Parameters & OtherParameters>;
}

export const ROOT_PATH = constructPath("", {}, {});

function constructPath<AbsolutePath extends string, PathParts, Parameters>(
    absolutePath: AbsolutePath,
    pathParts: PathParts,
    parameters: Parameters
): Path<AbsolutePath, PathParts, Parameters> {
    return {
        absolutePath,
        pathParts,
        parameters,
        addPath: <PathPart extends string>(pathPart: PathPart) => {
            const newPathPartsMap = {
                [pathPart]: pathPart,
            } as Record<PathPart, PathPart>;
            return constructPath(
                `${absolutePath}/${pathPart}`,
                {
                    ...pathParts,
                    ...newPathPartsMap,
                },
                parameters
            );
        },
        addParameter: <Parameter extends string>(parameter: Parameter) => {
            const newParametersMap = {
                [parameter]: parameter,
            } as Record<Parameter, Parameter>;
            return constructPath(`${absolutePath}/:${parameter}`, pathParts, {
                ...parameters,
                ...newParametersMap,
            });
        },
        addSplat: () =>
            constructPath(`${absolutePath}/*`, pathParts, {
                ...parameters,
                "*": "*",
            }),
        join: (otherPath) =>
            constructPath(
                `${absolutePath}${otherPath.absolutePath}`,
                {
                    ...pathParts,
                    ...otherPath.pathParts,
                },
                {
                    ...parameters,
                    ...otherPath.parameters,
                }
            ),
    };
}
