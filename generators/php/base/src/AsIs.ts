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
    Redactor = "Client/Redactor.Template.php",
    RetryMiddleware = "Client/RetryMiddleware.Template.php",
    RawClientTest = "Client/RawClientTest.Template.php",

    // Core/Json files.
    JsonApiRequest = "Json/JsonApiRequest.Template.php",
    JsonDecoder = "Json/JsonDecoder.Template.php",
    JsonDeserializer = "Json/JsonDeserializer.Template.php",
    JsonEncoder = "Json/JsonEncoder.Template.php",
    JsonProperty = "Json/JsonProperty.Template.php",
    JsonSerializer = "Json/JsonSerializer.Template.php",
    JsonSerializableType = "Json/JsonSerializableType.Template.php",
    Utils = "Json/Utils.Template.php",

    // Core/Multipart files.
    MultipartApiRequest = "Multipart/MultipartApiRequest.Template.php",
    MultipartFormData = "Multipart/MultipartFormData.Template.php",
    MultipartFormDataPart = "Multipart/MultipartFormDataPart.Template.php",

    // Core/Pagination files.
    CursorPager = "Pagination/CursorPager.Template.php",
    OffsetPager = "Pagination/OffsetPager.Template.php",
    Page = "Pagination/Page.Template.php",
    Pager = "Pagination/Pager.Template.php",
    PaginationHelper = "Pagination/PaginationHelper.Template.php",

    // Tests/Core/Json files.
    AdditionalPropertiesTest = "Json/AdditionalPropertiesTest.Template.php",
    DateArrayTest = "Json/DateArrayTest.Template.php",
    EmptyArrayTest = "Json/EmptyArrayTest.Template.php",
    EnumTest = "Json/EnumTest.Template.php",
    ExhaustiveTest = "Json/ExhaustiveTest.Template.php",
    InvalidTest = "Json/InvalidTest.Template.php",
    NestedUnionArrayTest = "Json/NestedUnionArrayTest.Template.php",
    NullableArrayTest = "Json/NullableArrayTest.Template.php",
    NullPropertyTest = "Json/NullPropertyTest.Template.php",
    ScalarTypesTest = "Json/ScalarTest.Template.php",
    TraitTest = "Json/TraitTest.Template.php",
    UnionArrayTest = "Json/UnionArrayTest.Template.php",
    UnionPropertyTest = "Json/UnionPropertyTest.Template.php",

    // Tests/Core/Pagination files.
    CursorPagerTest = "Pagination/CursorPagerTest/CursorPagerTest.Template.php",
    HasNextPageOffsetPagerTest = "Pagination/HasNextPageOffsetPagerTest/HasNextPageOffsetPagerTest.Template.php",
    IntOffsetPagerTest = "Pagination/IntOffsetPagerTest/IntOffsetPagerTest.Template.php",
    StepOffsetPagerTest = "Pagination/StepOffsetPagerTest/StepOffsetPagerTest.Template.php",
    GeneratorPagerTest = "Pagination/GeneratorPagerTest/GeneratorPagerTest.Template.php",
    DeepSetTest = "Pagination/DeepSetTest.Template.php",
    DeepSetAccessorsTest = "Pagination/DeepSetAccessorsTest.Template.php",
    CreateRequestWithDefaultsTest = "Pagination/CreateRequestWithDefaultsTest.Template.php",

    // Core/Types files.
    ArrayType = "Types/ArrayType.Template.php",
    Constant = "Types/Constant.Template.php",
    Date = "Types/Date.Template.php",
    Union = "Types/Union.Template.php",

    // Utils files.
    // TODO: Should add explicit "core" and "utils" prefixes to organize better
    File = "File.Template.php"
}
