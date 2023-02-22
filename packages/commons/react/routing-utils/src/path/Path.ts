export interface Path<RelativePath extends string, PathParts, Parameters> {
    readonly absolutePath: AbsolutePath<RelativePath>;
    readonly pathParts: PathParts;
    readonly parameters: Parameters;
    readonly addPath: <NewPath extends string>(
        path: NewPath
    ) => Path<`${RelativePath}/${NewPath}`, PathParts & Record<NewPath, NewPath>, Parameters>;
    readonly addParameter: <Parameter extends string>(
        parameter: Parameter
    ) => Path<`${RelativePath}/:${Parameter}`, PathParts, Parameters & Record<Parameter, Parameter>>;
    readonly addSplat: () => Path<`${RelativePath}/*`, PathParts, Parameters & Record<"*", "*">>;
    readonly join: <OtherPath extends string, OtherPathParts, OtherParameters>(
        suffix: Path<OtherPath, OtherPathParts, OtherParameters>
    ) => Path<`${RelativePath}${AbsolutePath<OtherPath>}`, PathParts & OtherPathParts, Parameters & OtherParameters>;
}

type AbsolutePath<RelativePath extends string> = RelativePath extends `/${string}` ? RelativePath : `/${RelativePath}`;

export const ROOT_PATH = constructPath("", {}, {});

function constructPath<RelativePath extends string, PathParts, Parameters>(
    relativePath: RelativePath,
    pathParts: PathParts,
    parameters: Parameters
): Path<RelativePath, PathParts, Parameters> {
    return {
        absolutePath: (relativePath.startsWith("/") ? relativePath : `/${relativePath}`) as AbsolutePath<RelativePath>,
        pathParts,
        parameters,
        addPath: <PathPart extends string>(pathPart: PathPart) => {
            const newPathPartsMap = {
                [pathPart]: pathPart,
            } as Record<PathPart, PathPart>;
            return constructPath(
                `${relativePath}/${pathPart}`,
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
            return constructPath(`${relativePath}/:${parameter}`, pathParts, {
                ...parameters,
                ...newParametersMap,
            });
        },
        addSplat: () =>
            constructPath(`${relativePath}/*`, pathParts, {
                ...parameters,
                "*": "*",
            }),
        join: (otherPath) =>
            constructPath(
                `${relativePath}${otherPath.absolutePath}`,
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
