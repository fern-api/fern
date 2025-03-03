export const ENUM_SERIALIZER_CLASS_NAME = "EnumSerializer";
export const STRING_ENUM_SERIALIZER_CLASS_NAME = "StringEnumSerializer";
export const ONE_OF_SERIALIZER_CLASS_NAME = "OneOfSerializer";
export const COLLECTION_ITEM_SERIALIZER_CLASS_NAME = "CollectionItemSerializer";
export const DATETIME_SERIALIZER_CLASS_NAME = "DateTimeSerializer";
export const CONSTANTS_CLASS_NAME = "Constants";
export const JSON_UTILS_CLASS_NAME = "JsonUtils";
export const JSON_ACCESS_ATTRIBUTE_NAME = "JsonAccess";

export const AsIsFiles = {
    CiYaml: "github-ci.yml",
    Constants: "Constants.Template.cs",
    CustomProps: "Custom.props.Template",
    ExceptionHandler: "ExceptionHandler.Template.cs",
    Extensions: "Extensions.cs",
    GitIgnore: ".gitignore.Template",
    GrpcRequestOptions: "GrpcRequestOptions.Template.cs",
    Headers: "Headers.Template.cs",
    HeaderValue: "HeaderValue.Template.cs",
    HttpMethodExtensions: "HttpMethodExtensions.cs",
    Page: "Page.Template.cs",
    Pager: "Pager.Template.cs",
    CustomPager: "CustomPager.Template.cs",
    ProtoAnyMapper: "ProtoAnyMapper.Template.cs",
    RawClient: "RawClient.Template.cs",
    RawGrpcClient: "RawGrpcClient.Template.cs",
    StringEnum: "StringEnum.Template.cs",
    StringEnumExtensions: "StringEnumExtensions.Template.cs",
    TemplateCsProj: "Template.csproj",
    UsingCs: "Using.cs",
    EditorConfig: ".editorconfig.Template",
    Json: {
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
        TestCustomProps: "test/Test.Custom.props.Template",
        TemplateTestClientCs: "test/TemplateTestClient.cs",
        TemplateTestCsProj: "test/Template.Test.csproj",
        RawClientTests: "test/RawClientTests.Template.cs",
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
            DateOnlyJsonTests: "test/Json/DateOnlyJsonTests.Template.cs",
            DateTimeJsonTests: "test/Json/DateTimeJsonTests.Template.cs",
            EnumSerializerTests: "test/Json/EnumSerializerTests.Template.cs",
            OneOfSerializerTests: "test/Json/OneOfSerializerTests.Template.cs",
            StringEnumSerializerTests: "test/Json/StringEnumSerializerTests.Template.cs",
            JsonAccessAttributeTests: "test/Json/JsonAccessAttributeTests.Template.cs"
        }
    }
};
