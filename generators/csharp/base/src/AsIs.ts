export const COLLECTION_ITEM_SERIALIZER_CLASS_NAME = "CollectionItemSerializer";
export const CONSTANTS_CLASS_NAME = "Constants";
export const DATETIME_SERIALIZER_CLASS_NAME = "DateTimeSerializer";
export const ENUM_SERIALIZER_CLASS_NAME = "EnumSerializer";
export const FILE_PARAMETER_CLASS_NAME = "FileParameter";
export const FORM_URL_ENCODER_CLASS_NAME = "FormUrlEncoder";
export const JSON_ACCESS_ATTRIBUTE_NAME = "JsonAccess";
export const JSON_UTILS_CLASS_NAME = "JsonUtils";
export const ONE_OF_SERIALIZER_CLASS_NAME = "OneOfSerializer";
export const QUERY_STRING_CONVERTER_CLASS_NAME = "QueryStringConverter";
export const STRING_ENUM_SERIALIZER_CLASS_NAME = "StringEnumSerializer";
export const VALUE_CONVERT_CLASS_NAME = "ValueConvert";

export const AsIsFiles = {
    CiYaml: "github-ci.yml",
    Constants: "Constants.Template.cs",
    CustomProps: "Custom.props.Template",
    EditorConfig: ".editorconfig.Template",
    ExceptionHandler: "ExceptionHandler.Template.cs",
    Extensions: "Extensions.cs",
    FileParameter: "FileParameter.Template.cs",
    GitIgnore: ".gitignore.Template",
    StringEnum: "StringEnum.Template.cs",
    StringEnumExtensions: "StringEnumExtensions.Template.cs",
    TemplateCsProj: "Template.csproj",
    UsingCs: "Using.cs",
    ValueConvert: "ValueConvert.Template.cs",
    // Grpc
    GrpcRequestOptions: "GrpcRequestOptions.Template.cs",
    ProtoAnyMapper: "ProtoAnyMapper.Template.cs",
    RawGrpcClient: "RawGrpcClient.Template.cs",
    // Pagination
    CustomPager: "CustomPager.Template.cs",
    CustomPagerContext: "CustomPagerContext.Template.cs",
    Page: "Page.Template.cs",
    Pager: "Pager.Template.cs",
    // HTTP
    ApiResponse: "ApiResponse.Template.cs",
    BaseRequest: "BaseRequest.Template.cs",
    EmptyRequest: "EmptyRequest.Template.cs",
    EncodingCache: "EncodingCache.Template.cs",
    FormUrlEncoder: "FormUrlEncoder.Template.cs",
    Headers: "Headers.Template.cs",
    HeaderValue: "HeaderValue.Template.cs",
    HttpMethodExtensions: "HttpMethodExtensions.cs",
    IIsRetryableContent: "IIsRetryableContent.Template.cs",
    JsonRequest: "JsonRequest.Template.cs",
    MultipartFormRequest: "MultipartFormRequest.Template.cs",
    NdJsonContent: "NdJsonContent.Template.cs",
    NdJsonRequest: "NdJsonRequest.Template.cs",
    QueryStringConverter: "QueryStringConverter.Template.cs",
    RawClient: "RawClient.Template.cs",
    StreamRequest: "StreamRequest.Template.cs",
    Json: {
        AdditionalProperties: "AdditionalProperties.Template.cs",
        CollectionItemSerializer: "CollectionItemSerializer.Template.cs",
        DateOnlyConverter: "DateOnlyConverter.Template.cs",
        DateTimeSerializer: "DateTimeSerializer.Template.cs",
        EnumConverter: "EnumConverter.Template.cs",
        EnumSerializer: "EnumSerializer.Template.cs",
        JsonAccessAttribute: "JsonAccessAttribute.Template.cs",
        JsonConfiguration: "JsonConfiguration.Template.cs",
        OneOfSerializer: "OneOfSerializer.Template.cs",
        StringEnumSerializer: "StringEnumSerializer.Template.cs"
    },
    Test: {
        QueryStringConverterTests: "test/QueryStringConverterTests.Template.cs",
        TemplateTestClientCs: "test/TemplateTestClient.cs",
        TemplateTestCsProj: "test/Template.Test.csproj",
        TestCustomProps: "test/Test.Custom.props.Template",
        RawClientTests: {
            AdditionalHeadersTests: "test/RawClientTests/AdditionalHeadersTests.Template.cs",
            AdditionalParametersTests: "test/RawClientTests/AdditionalParametersTests.Template.cs",
            MultipartFormTests: "test/RawClientTests/MultipartFormTests.Template.cs",
            RetriesTests: "test/RawClientTests/RetriesTests.Template.cs",
            QueryParameterTests: "test/RawClientTests/QueryParameterTests.Template.cs"
        },
        Utils: {
            JsonElementComparer: "test/Utils/JsonElementComparer.Template.cs",
            NUnitExtensions: "test/Utils/NUnitExtensions.Template.cs",
            OneOfComparer: "test/Utils/OneOfComparer.Template.cs",
            ReadOnlyMemoryComparer: "test/Utils/ReadOnlyMemoryComparer.Template.cs"
        },
        Pagination: [
            "test/Pagination/GuidCursorTest.Template.cs",
            "test/Pagination/HasNextPageOffsetTest.Template.cs",
            "test/Pagination/IntOffsetTest.Template.cs",
            "test/Pagination/LongOffsetTest.Template.cs",
            "test/Pagination/NoRequestCursorTest.Template.cs",
            "test/Pagination/NoRequestOffsetTest.Template.cs",
            "test/Pagination/StepOffsetTest.Template.cs",
            "test/Pagination/StringCursorTest.Template.cs"
        ],
        Json: {
            AdditionalPropertiesTests: "test/Json/AdditionalPropertiesTests.Template.cs",
            DateOnlyJsonTests: "test/Json/DateOnlyJsonTests.Template.cs",
            DateTimeJsonTests: "test/Json/DateTimeJsonTests.Template.cs",
            EnumSerializerTests: "test/Json/EnumSerializerTests.Template.cs",
            JsonAccessAttributeTests: "test/Json/JsonAccessAttributeTests.Template.cs",
            OneOfSerializerTests: "test/Json/OneOfSerializerTests.Template.cs",
            StringEnumSerializerTests: "test/Json/StringEnumSerializerTests.Template.cs"
        }
    }
};
