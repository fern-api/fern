import { AbstractCsharpGeneratorContext, AsIsFiles } from "@fern-api/csharp-codegen";
import { RelativeFilePath } from "@fern-api/fs-utils";

import { FernFilepath, TypeId } from "@fern-fern/ir-sdk/api";

import { ModelCustomConfigSchema } from "./ModelCustomConfig";

export class ModelGeneratorContext extends AbstractCsharpGeneratorContext<ModelCustomConfigSchema> {
    /**
     * __package__.yml types are stored at the top level
     * __{{file}}__.yml types are stored in a directory with the same name as the file
     *
     * @param typeId The type id of the type declaration
     * @returns
     */
    public getDirectoryForTypeId(typeId: TypeId): RelativeFilePath {
        const typeDeclaration = this.getTypeDeclarationOrThrow(typeId);
        return RelativeFilePath.of(
            [...typeDeclaration.name.fernFilepath.allParts.map((path) => path.pascalCase.safeName)].join("/")
        );
    }

    public getNamespaceForTypeId(typeId: TypeId): string {
        const typeDeclaration = this.getTypeDeclarationOrThrow(typeId);
        return [
            this.getNamespace(),
            ...typeDeclaration.name.fernFilepath.packagePath.map((path) => path.pascalCase.safeName)
        ].join(".");
    }

    public getRawAsIsFiles(): string[] {
        return [AsIsFiles.GitIgnore];
    }

    public getCoreAsIsFiles(): string[] {
        const files = [
            AsIsFiles.CollectionItemSerializer,
            AsIsFiles.Constants,
            AsIsFiles.DateTimeSerializer,
            AsIsFiles.JsonConfiguration,
            AsIsFiles.OneOfSerializer
        ];
        if (this.customConfig["experimental-enable-forward-compatible-enums"] ?? false) {
            files.push(AsIsFiles.StringEnum);
            files.push(AsIsFiles.StringEnumExtensions);
            files.push(AsIsFiles.StringEnumSerializer);
        } else {
            files.push(AsIsFiles.EnumSerializer);
        }
        return files;
    }

    public getCoreTestAsIsFiles(): string[] {
        const files = [];
        if (this.customConfig["experimental-enable-forward-compatible-enums"] ?? false) {
            files.push(AsIsFiles.Test.StringEnumSerializerTests);
        } else {
            files.push(AsIsFiles.Test.EnumSerializerTests);
        }
        return files;
    }

    public getPublicCoreAsIsFiles(): string[] {
        return [];
    }

    public getPublicCoreTestAsIsFiles(): string[] {
        return [];
    }

    public getAsIsTestUtils(): string[] {
        return [];
    }

    public getExtraDependencies(): Record<string, string> {
        return {};
    }

    override getChildNamespaceSegments(fernFilepath: FernFilepath): string[] {
        return fernFilepath.packagePath.map((segmentName) => segmentName.pascalCase.safeName);
    }
}
