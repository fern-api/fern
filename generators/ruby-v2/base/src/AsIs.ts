import { utimes } from "fs";

export const AsIsFiles = {
    ModelField: "types/model/field.Template.rb",
    Model: "types/model.Template.rb",
    Array: "types/array.Template.rb",

    // Errors
    ErrorsConstraint: "errors/constraint_error.Template.rb",
    ErrorsType: "errors/type_error.Template.rb",

    // HTTP
    HttpBaseRequest: "http/base_request.Template.rb",
    HttpRawClient: "http/raw_client.Template.rb",

    // JSON
    JsonRequest: "json/request.Template.rb",
    JsonSerializable: "json/serializable.Template.rb",

    // Multipart
    MultipartEncoder: "multipart/multipart_encoder.Template.rb",
    MultipartFormDataPart: "multipart/multipart_form_data_part.Template.rb",
    MultipartFormData: "multipart/multipart_form_data.Template.rb",
    MultipartRequest: "multipart/multipart_request.Template.rb",

    // Types
    TypesModelField: "types/model/field.Template.rb",
    TypesArray: "types/array.Template.rb",
    TypesBoolean: "types/boolean.Template.rb",
    TypesEnum: "types/enum.Template.rb",
    TypesHash: "types/hash.Template.rb",
    TypesModel: "types/model.Template.rb",
    TypesType: "types/type.Template.rb",
    TypesUnion: "types/union.Template.rb",
    TypesUnknown: "types/unknown.Template.rb",
    TypesUtils: "types/utils.Template.rb"
} as const;

export function topologicalCompareAsIsFiles(fileA: string, fileB: string): number {
    const validFiles = Object.values(AsIsFiles);
    if (
        validFiles.includes(fileA as (typeof validFiles)[number]) &&
        validFiles.includes(fileB as (typeof validFiles)[number])
    ) {
        return asIsTopoValue[fileA as keyof typeof asIsTopoValue] - asIsTopoValue[fileB as keyof typeof asIsTopoValue];
    }
    throw new Error(`Invalid file: ${fileA} or ${fileB}`);
}

const asIsTopoValue = {
    [AsIsFiles.JsonSerializable]: 0,
    [AsIsFiles.TypesType]: 1,
    [AsIsFiles.TypesUtils]: 2,
    [AsIsFiles.TypesUnion]: 3,
    [AsIsFiles.ErrorsConstraint]: 4,
    [AsIsFiles.ErrorsType]: 5,
    [AsIsFiles.HttpBaseRequest]: 6,
    [AsIsFiles.JsonRequest]: 7,
    [AsIsFiles.HttpRawClient]: 8,
    [AsIsFiles.MultipartEncoder]: 9,
    [AsIsFiles.MultipartFormDataPart]: 10,
    [AsIsFiles.MultipartFormData]: 11,
    [AsIsFiles.MultipartRequest]: 12,
    [AsIsFiles.ModelField]: 13,
    [AsIsFiles.Model]: 14,
    [AsIsFiles.Array]: 15,
    [AsIsFiles.TypesBoolean]: 16,
    [AsIsFiles.TypesEnum]: 17,
    [AsIsFiles.TypesHash]: 18,
    [AsIsFiles.TypesUnknown]: 19
};
