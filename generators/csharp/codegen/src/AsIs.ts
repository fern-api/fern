export const STRING_ENUM_SERIALIZER_CLASS_NAME = "StringEnumSerializer";
export const ONE_OF_SERIALIZER_CLASS_NAME = "OneOfSerializer";
export const COLLECTION_ITEM_SERIALIZER_CLASS_NAME = "CollectionItemSerializer";
export const DATETIME_SERIALIZER_CLASS_NAME = "DateTimeSerializer";
export const CONSTANTS_CLASS_NAME = "Constants";
export const JSON_UTILS_CLASS_NAME = "JsonUtils";

export enum AsIsFiles {
    CiYaml = "github-ci.yml",
    CollectionItemSerializer = "CollectionItemSerializer.cs",
    Constants = "Constants.cs",
    DateTimeSerializer = "DateTimeSerializer.cs",
    EnumConverter = "EnumConverter.Template.cs",
    GrpcRequestOptions = "GrpcRequestOptions.Template.cs",
    HttpMethodExtensions = "HttpMethodExtensions.cs",
    JsonConfiguration = "JsonConfiguration.cs",
    OneOfSerializer = "OneOfSerializer.cs",
    RawClient = "RawClient.Template.cs",
    StringEnum = "StringEnum.Template.cs",
    StringEnumSerializer = "StringEnumSerializer.cs",
    TemplateCsProj = "Template.csproj",
    TemplateTestCsProj = "Template.Test.csproj",
    TemplateTestClientCs = "TemplateTestClient.cs",
    UsingCs = "Using.cs",
    Extensions = "Extensions.cs"
}
