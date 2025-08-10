import { AbstractFormatter, FernGeneratorExec, GeneratorNotificationService } from "@fern-api/base-generator";
import { AbstractRubyGeneratorContext } from "@fern-api/ruby-ast";
import { AsIsFiles } from "@fern-api/ruby-base";
import { RelativeFilePath } from "@fern-api/fs-utils";

import { ModelCustomConfigSchema } from "./ModelCustomConfig";

export class ModelGeneratorContext extends AbstractRubyGeneratorContext<ModelCustomConfigSchema> {
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
