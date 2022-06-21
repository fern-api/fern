import { NamedType } from "@fern-api/api";
import path from "path";
import { Directory } from "ts-morph";

export type TypeCategory = "error" | "type" | "service-type";

export declare namespace getFilePathForNamedType {
    interface Args {
        modelDirectory: Directory;
        typeName: NamedType;
        typeCategory: TypeCategory;
    }
}

export function getFilePathForNamedType({
    typeName,
    modelDirectory,
    typeCategory,
}: getFilePathForNamedType.Args): string {
    return `${path.join(
        modelDirectory.getPath(),
        typeName.fernFilepath,
        getSubDirectoryForCategory(typeCategory),
        typeName.name
    )}.ts`;
}

function getSubDirectoryForCategory(category: TypeCategory): string {
    switch (category) {
        case "type":
            return "types";
        case "error":
            return "errors";
        case "service-type":
            return "service-types";
    }
}
