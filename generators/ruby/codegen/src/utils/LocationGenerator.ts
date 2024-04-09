import { DeclaredServiceName, DeclaredTypeName, FernFilepath } from "@fern-fern/ir-sdk/api";
import { snakeCase } from "lodash-es";
import { TYPES_DIRECTORY } from "./RubyConstants";

export class LocationGenerator {
    public rootModule: string;
    private directoryPrefix: string;
    constructor(directoryPrefix: string, rootModule: string) {
        this.directoryPrefix = directoryPrefix;
        this.rootModule = rootModule;
    }

    public getLocationForTypeDeclaration(declaredTypeName: DeclaredTypeName): string {
        return [
            snakeCase(this.directoryPrefix),
            ...declaredTypeName.fernFilepath.allParts.map((pathPart) => pathPart.snakeCase.safeName),
            TYPES_DIRECTORY,
            declaredTypeName.name.snakeCase.safeName
        ].join("/");
    }

    public getLocationForServiceDeclaration(declaredServiceName: DeclaredServiceName): string {
        return [
            snakeCase(this.directoryPrefix),
            ...declaredServiceName.fernFilepath.packagePath.map((pathPart) => pathPart.snakeCase.safeName),
            declaredServiceName.fernFilepath.file?.snakeCase.safeName,
            "client"
        ]
            .filter((p) => p !== undefined)
            .join("/");
    }

    // Note: this assumes the file is in a directory of the same name
    public getLocationFromFernFilepath(fernFilepath: FernFilepath, fileName?: string): string {
        return [
            snakeCase(this.directoryPrefix),
            ...fernFilepath.allParts.map((pathPart) => pathPart.snakeCase.safeName),
            fileName
        ]
            .filter((p) => p !== undefined)
            .join("/");
    }
}
