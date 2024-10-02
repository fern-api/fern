export enum AsIsFiles {
    // Top-level files.
    GithubCiYml = "github-ci.yml",
    GitIgnore = ".gitignore",
    PhpStanNeon = "phpstan.neon",
    PhpUnitXml = "phpunit.xml",

    // Core/Client files.
    BaseApiRequest = "Client/BaseApiRequest.Template.php",
    HttpMethod = "Client/HttpMethod.Template.php",
    RawClient = "Client/RawClient.Template.php",
    RawClientTest = "Client/RawClientTest.Template.php",

    // Core/Json files.
    JsonApiRequest = "Json/JsonApiRequest.Template.php",
    JsonDecoder = "Json/JsonDecoder.Template.php",
    JsonDeserializer = "Json/JsonDeserializer.Template.php",
    JsonEncoder = "Json/JsonEncoder.Template.php",
    JsonProperty = "Json/JsonProperty.Template.php",
    JsonSerializer = "Json/JsonSerializer.Template.php",
    SerializableType = "Json/SerializableType.Template.php",
    Utils = "Json/Utils.Template.php",

    // Tests/Core/Json files.
    DateArrayTypeTest = "Json/DateArrayTypeTest.Template.php",
    EmptyArraysTest = "Json/EmptyArraysTest.Template.php",
    EnumTest = "Json/EnumTest.Template.php",
    TraitTest = "Json/TraitTest.Template.php",
    InvalidTypesTest = "Json/InvalidTypesTest.Template.php",
    MixedDateArrayTypeTest = "Json/MixedDateArrayTypeTest.Template.php",
    NestedUnionArrayTypeTest = "Json/NestedUnionArrayTypeTest.Template.php",
    NullableArrayTypeTest = "Json/NullableArrayTypeTest.Template.php",
    NullPropertyTypeTest = "Json/NullPropertyTypeTest.Template.php",
    ScalarTypesTest = "Json/ScalarTypesTest.Template.php",
    TestTypeTest = "Json/TestTypeTest.Template.php",
    UnionArrayTypeTest = "Json/UnionArrayTypeTest.Template.php",
    UnionPropertyTypeTest = "Json/UnionPropertyTypeTest.Template.php",

    // Core/Types files.
    ArrayType = "Types/ArrayType.Template.php",
    Constant = "Types/Constant.Template.php",
    DateType = "Types/DateType.Template.php",
    Union = "Types/Union.Template.php",

    // Core/Multipart
    MultipartApiRequest = "MultipartApiRequest.Template.php",
    MultipartFormData = "MultipartFormData.Template.php",
    MultipartFormDataPart = "MultipartFormDataPart.Template.php",

    // Utils
    File = "File.Template.php"
}
