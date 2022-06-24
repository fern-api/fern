import { DependencyManager, getReferenceToFernServiceUtilsType } from "@fern-typescript/commons";
import { SourceFile, ts } from "ts-morph";

export function generateMaybePromise({
    type,
    dependencyManager,
    file,
}: {
    type: ts.TypeNode;
    dependencyManager: DependencyManager;
    file: SourceFile;
}): ts.TypeNode {
    return getReferenceToFernServiceUtilsType({
        type: "MaybePromise",
        dependencyManager,
        referencedIn: file,
        typeArguments: [type],
    });
}
