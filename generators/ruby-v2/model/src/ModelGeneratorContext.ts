import { RelativeFilePath, join } from "@fern-api/fs-utils";
import { AbstractRubyGeneratorContext, AsIsFiles } from "@fern-api/ruby-base";
import { ruby } from "@fern-api/ruby-ast";

import { TypeDeclaration, TypeId } from "@fern-fern/ir-sdk/api";
import { ModelCustomConfigSchema } from "./ModelCustomConfig";

export class ModelGeneratorContext extends AbstractRubyGeneratorContext<ModelCustomConfigSchema> {
    public getLocationForTypeId(typeId: TypeId): RelativeFilePath {
        const typeDeclaration = this.getTypeDeclarationOrThrow(typeId);
        return join(
            RelativeFilePath.of("lib"),
            RelativeFilePath.of(this.getRootFolderName()),
            ...this.snakeNames(typeDeclaration).map(RelativeFilePath.of),
            RelativeFilePath.of(this.typesDirName)
        );
    }

    public getModuleNamesForTypeId(typeId: TypeId): string[] {
        const typeDeclaration = this.getTypeDeclarationOrThrow(typeId);
        return [
            this.getRootModule().name,
            ...this.pascalNames(typeDeclaration),
            this.getTypesModule().name
        ];
    }

    public getModulesForTypeId(typeId: TypeId): ruby.Module_[] {
        const modules = this.getModuleNamesForTypeId(typeId);
        return modules.map((name) => ruby.module({ name }));
    }

    public getCoreAsIsFiles(): string[] {
        const files = [
            // Errors
            AsIsFiles.ErrorsConstraint,
            AsIsFiles.ErrorsType,

            // HTTP
            AsIsFiles.HttpBaseRequest,
            AsIsFiles.HttpRawClient,

            // JSON
            AsIsFiles.JsonRequest,
            AsIsFiles.JsonSerializable,

            // Multipart
            AsIsFiles.MultipartEncoder,
            AsIsFiles.MultipartFormDataPart,
            AsIsFiles.MultipartFormData,
            AsIsFiles.MultipartRequest,

            // Types
            AsIsFiles.TypesModelField,
            AsIsFiles.TypesArray,
            AsIsFiles.TypesBoolean,
            AsIsFiles.TypesEnum,
            AsIsFiles.TypesHash,
            AsIsFiles.TypesModel,
            AsIsFiles.TypesType,
            AsIsFiles.TypesUnion,
            AsIsFiles.TypesUnknown,
            AsIsFiles.TypesUtils
        ];

        return files;
    }
}
