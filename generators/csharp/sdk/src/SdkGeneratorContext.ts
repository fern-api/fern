import { AbstractCsharpGeneratorContext } from "@fern-api/csharp-codegen";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { TypeId } from "@fern-fern/ir-sdk/api";
import { SdkCustomConfigSchema } from "./SdkCustomConfig";

const TYPES_FOLDER_NAME = "Types";

export class SdkGeneratorContext extends AbstractCsharpGeneratorContext<SdkCustomConfigSchema> {
    /**
     * __package__.yml types are stored in a Types directory (e.g. /src/Types)
     * __{{file}}__.yml types are stored in a directory with the same name as the file
     * (e.g. /src/{{file}}/Types)
     *
     * @param typeId The type id of the type declaration
     * @returns
     */
    public getDirectoryForTypeId(typeId: TypeId): RelativeFilePath {
        const typeDeclaration = this.ir.types[typeId];
        if (typeDeclaration == null) {
            throw new Error(`Type declaration with id ${typeId} not found`);
        }
        return RelativeFilePath.of(
            [
                ...typeDeclaration.name.fernFilepath.allParts.map((path) => path.pascalCase.safeName),
                TYPES_FOLDER_NAME
            ].join("/")
        );
    }

    public getNamespaceForTypeId(typeId: TypeId): string {
        const typeDeclaration = this.ir.types[typeId];
        if (typeDeclaration == null) {
            throw new Error(`Type declaration with id ${typeId} not found`);
        }
        return [
            this.getNamespace(),
            ...typeDeclaration.name.fernFilepath.packagePath.map((path) => path.pascalCase.safeName)
        ].join(".");
    }
}
