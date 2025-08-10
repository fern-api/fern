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
