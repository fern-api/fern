import { RelativeFilePath, join } from "@fern-api/fs-utils";
import { AbstractRubyGeneratorContext, AsIsFiles } from "@fern-api/ruby-base";

import { FernIr } from "@fern-fern/ir-sdk";
import { TypeId, TypeDeclaration, FernFilepath, Name } from "@fern-fern/ir-sdk/api";
import { ModelCustomConfigSchema } from "./ModelCustomConfig";

export class ModelGeneratorContext extends AbstractRubyGeneratorContext<ModelCustomConfigSchema> {
    public getLocationForTypeId(typeId: TypeId): RelativeFilePath {
        return join(
            RelativeFilePath.of("lib"),
            this.getDirectoryForTypeId(typeId)
        );
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
