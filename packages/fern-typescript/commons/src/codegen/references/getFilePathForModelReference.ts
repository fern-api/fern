import { ModelReference } from "@fern-api/api";
import path from "path";
import { Directory } from "ts-morph";

export type TypeCategory = "error" | "type";

export declare namespace getFilePathForModelReference {
    interface Args {
        reference: ModelReference;
        modelDirectory: Directory;
    }
}

export function getFilePathForModelReference({ reference, modelDirectory }: getFilePathForModelReference.Args): string {
    const fernFilepath = ModelReference._visit(reference, {
        type: ({ fernFilepath }) => fernFilepath,
        error: ({ fernFilepath }) => fernFilepath,
        _unknown: () => {
            throw new Error("Unknown model reference: " + reference._type);
        },
    });

    const name = ModelReference._visit(reference, {
        type: ({ name }) => name,
        error: ({ name }) => name,
        _unknown: () => {
            throw new Error("Unknown model reference: " + reference._type);
        },
    });

    const intermediateDirectories = ModelReference._visit(reference, {
        type: () => ["types"],
        error: () => ["errors"],
        _unknown: () => {
            throw new Error("Unknown model reference: " + reference._type);
        },
    });

    return path.join(modelDirectory.getPath(), fernFilepath, ...intermediateDirectories, `${name}.ts`);
}
