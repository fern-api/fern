import { snakeCase } from "lodash-es";

import { DeclaredServiceName, DeclaredTypeName, FernFilepath } from "@fern-fern/ir-sdk/api";

import { TYPES_DIRECTORY, TYPES_MODULE } from "./RubyConstants";

export class LocationGenerator {
    public rootModule: string;
    public shouldFlattenModules: boolean;
    private directoryPrefix: string;

    constructor(directoryPrefix: string, rootModule: string, shouldFlattenModules: boolean) {
        this.directoryPrefix = directoryPrefix;
        this.rootModule = rootModule;
        this.shouldFlattenModules = shouldFlattenModules;
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

    public getModuleBreadcrumbs({
        path,
        includeFilename,
        isType
    }: {
        path: FernFilepath;
        includeFilename: boolean;
        isType?: boolean;
    }): string[] {
        const classPath = this.getClassPathFromTypeName(path);
        if (!this.shouldFlattenModules) {
            const modulePath = this.getModulePathFromTypeName(path);
            return [
                this.rootModule,
                ...(includeFilename && classPath !== undefined ? modulePath.concat([classPath]) : modulePath)
            ];
        } else {
            const modulePath = this.getModulePathFromTypeName(path, isType);
            return [this.rootModule, ...modulePath, ...(isType ? [TYPES_MODULE] : [])];
        }
    }

    public getModulePathFromTypeName(path: FernFilepath, allParts?: boolean): string[] {
        return (allParts ? path.allParts : path.packagePath).map((pathSegment) => pathSegment.pascalCase.safeName);
    }

    public getClassPathFromTypeName(path: FernFilepath): string | undefined {
        return path.file?.pascalCase.safeName;
    }
}
