export const AsIsFiles = {
    // GitHub CI workflow
    GithubCiYml: "github-ci.yml",

    // Gitignore
    Gitignore: "gitignore",

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

    // Iterator classes
    ItemIterator: "internal/iterators/item_iterator.Template.rb",
    CursorItemIterator: "internal/iterators/cursor_item_iterator.Template.rb",
    OffsetItemIterator: "internal/iterators/offset_item_iterator.Template.rb",
    CursorPageIterator: "internal/iterators/cursor_page_iterator.Template.rb",
    OffsetPageIterator: "internal/iterators/offset_page_iterator.Template.rb",
    CustomPager: "internal/iterators/custom_pager.Template.rb",

    // Logging
    LoggingLogLevel: "internal/logging/log_level.Template.rb",
    LoggingILogger: "internal/logging/i_logger.Template.rb",
    LoggingConsoleLogger: "internal/logging/console_logger.Template.rb",
    LoggingNoOpLogger: "internal/logging/no_op_logger.Template.rb",
    LoggingMiddleware: "internal/logging/logging_middleware.Template.rb",

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
    TypesUtils: "internal/types/utils.Template.rb",

    // Test files
    TestHelper: "test/test_helper.Template.rb",
    TestCursorItemIterator: "test/unit/internal/iterators/test_cursor_item_iterator.Template.rb",
    TestOffsetItemIterator: "test/unit/internal/iterators/test_offset_item_iterator.Template.rb",
    TestArrayType: "test/unit/internal/types/test_array.Template.rb",
    TestBooleanType: "test/unit/internal/types/test_boolean.Template.rb",
    TestEnumType: "test/unit/internal/types/test_enum.Template.rb",
    TestHashType: "test/unit/internal/types/test_hash.Template.rb",
    TestModelType: "test/unit/internal/types/test_model.Template.rb",
    TestUnionType: "test/unit/internal/types/test_union.Template.rb",
    TestTypeUtils: "test/unit/internal/types/test_utils.Template.rb"
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
    [AsIsFiles.LoggingLogLevel]: 0,
    [AsIsFiles.LoggingILogger]: 1,
    [AsIsFiles.LoggingConsoleLogger]: 2,
    [AsIsFiles.LoggingNoOpLogger]: 3,
    [AsIsFiles.LoggingMiddleware]: 4,
    [AsIsFiles.JsonSerializable]: 6,
    [AsIsFiles.TypesType]: 7,
    [AsIsFiles.TypesUtils]: 8,
    [AsIsFiles.TypesUnion]: 9,
    [AsIsFiles.ErrorsConstraint]: 10,
    [AsIsFiles.ErrorsType]: 11,
    [AsIsFiles.HttpBaseRequest]: 12,
    [AsIsFiles.JsonRequest]: 13,
    [AsIsFiles.HttpRawClient]: 14,
    [AsIsFiles.MultipartEncoder]: 15,
    [AsIsFiles.MultipartFormDataPart]: 16,
    [AsIsFiles.MultipartFormData]: 17,
    [AsIsFiles.MultipartRequest]: 18,
    [AsIsFiles.ModelField]: 19,
    [AsIsFiles.Model]: 20,
    [AsIsFiles.Array]: 21,
    [AsIsFiles.TypesBoolean]: 22,
    [AsIsFiles.TypesEnum]: 23,
    [AsIsFiles.TypesHash]: 24,
    [AsIsFiles.TypesUnknown]: 25,
    [AsIsFiles.ApiError]: 26,
    [AsIsFiles.ResponseError]: 27,
    [AsIsFiles.ClientError]: 28,
    [AsIsFiles.RedirectError]: 29,
    [AsIsFiles.ServerError]: 30,
    [AsIsFiles.TimeoutError]: 31,
    [AsIsFiles.ItemIterator]: 32,
    [AsIsFiles.CursorItemIterator]: 33,
    [AsIsFiles.OffsetItemIterator]: 34,
    [AsIsFiles.CursorPageIterator]: 35,
    [AsIsFiles.OffsetPageIterator]: 36,
    [AsIsFiles.CustomPager]: 37
};
