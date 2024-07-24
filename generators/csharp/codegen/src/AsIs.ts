export const STRING_ENUM_SERIALIZER_CLASS_NAME = "StringEnumSerializer";
export const ONE_OF_SERIALIZER_CLASS_NAME = "OneOfSerializer";
export const COLLECTION_ITEM_SERIALIZER_CLASS_NAME = "CollectionItemSerializer";
export const DATETIME_SERIALIZER_CLASS_NAME = "DateTimeSerializer";
export const CONSTANTS_CLASS_NAME = "Constants";
export const JSON_UTILS_CLASS_NAME = "JsonUtils";

export enum AsIsFiles {
    EnumConverter = "EnumConverter.Template.cs",
    StringEnum = "StringEnum.Template.cs",
    TemplateCsProj = "Template.csproj",
    TemplateTestCsProj = "Template.Test.csproj",
    TemplateTestClientCs = "TemplateTestClient.cs",
    UsingCs = "Using.cs",
    RawClient = "RawClient.Template.cs",
    CiYaml = "github-ci.yml",
    StringEnumSerializer = "StringEnumSerializer.cs",
    OneOfSerializer = "OneOfSerializer.cs",
    CollectionItemSerializer = "CollectionItemSerializer.cs",
    HttpMethodExtensions = "HttpMethodExtensions.cs",
    Constants = "Constants.cs",
    DateTimeSerializer = "DateTimeSerializer.cs",
    JsonConfiguration = "JsonConfiguration.cs"
}
