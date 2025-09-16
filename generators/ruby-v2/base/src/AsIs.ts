export const AsIsFiles = {
    // Public-facing error classes
    ApiError: "errors/api_error.Template.rb",
    ClientError: "errors/client_error.Template.rb",
    RedirectError: "errors/redirect_error.Template.rb",
    ResponseError: "errors/response_error.Template.rb",
    ServerError: "errors/server_error.Template.rb",
    TimeoutError: "errors/timeout_error.Template.rb",

    // Internal error classes
    ErrorsConstraint: "internal/errors/constraint_error.Template.rb",
    ErrorsType: "internal/errors/type_error.Template.rb",

    // HTTP
    HttpBaseRequest: "internal/http/base_request.Template.rb",
    HttpRawClient: "internal/http/raw_client.Template.rb",

    // JSON
    JsonRequest: "internal/json/request.Template.rb",
    JsonSerializable: "internal/json/serializable.Template.rb",

    // Multipart
    MultipartEncoder: "internal/multipart/multipart_encoder.Template.rb",
    MultipartFormDataPart: "internal/multipart/multipart_form_data_part.Template.rb",
    MultipartFormData: "internal/multipart/multipart_form_data.Template.rb",
    MultipartRequest: "internal/multipart/multipart_request.Template.rb",

    // Types
    ModelField: "internal/types/model/field.Template.rb",
    Model: "internal/types/model.Template.rb",
    Array: "internal/types/array.Template.rb",
    TypesModelField: "internal/types/model/field.Template.rb",
    TypesArray: "internal/types/array.Template.rb",
    TypesBoolean: "internal/types/boolean.Template.rb",
    TypesEnum: "internal/types/enum.Template.rb",
    TypesHash: "internal/types/hash.Template.rb",
    TypesModel: "internal/types/model.Template.rb",
    TypesType: "internal/types/type.Template.rb",
    TypesUnion: "internal/types/union.Template.rb",
    TypesUnknown: "internal/types/unknown.Template.rb",
    TypesUtils: "internal/types/utils.Template.rb"
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
    [AsIsFiles.TypesUnknown]: 19,
    [AsIsFiles.ApiError]: 20,
    [AsIsFiles.ResponseError]: 21,
    [AsIsFiles.ClientError]: 22,
    [AsIsFiles.RedirectError]: 23,
    [AsIsFiles.ServerError]: 24,
    [AsIsFiles.TimeoutError]: 25
};
