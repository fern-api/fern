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
    FormRequest: "FormRequest.Template.cs",
    MultipartFormRequest: "MultipartFormRequest.Template.cs",
    NdJsonContent: "NdJsonContent.Template.cs",
    NdJsonRequest: "NdJsonRequest.Template.cs",
    QueryStringConverter: "QueryStringConverter.Template.cs",
    RawClient: "RawClient.Template.cs",
    StreamRequest: "StreamRequest.Template.cs",
    WebSocketAsync: {
        Events: {
            Closed: "Async/Events/Closed.Template.cs",
            Connected: "Async/Events/Connected.Template.cs",
            Event: "Async/Events/Event.Template.cs"
        },
        Exceptions: {
            WebsocketException: "Async/Exceptions/WebsocketException.Template.cs"
        },
        Models: {
            Options: "Async/Models/Options.Template.cs",
            DisconnectionInfo: "Async/Models/DisconnectionInfo.Template.cs",
            DisconnectionType: "Async/Models/DisconnectionType.Template.cs",
            ReconnectionInfo: "Async/Models/ReconnectionInfo.Template.cs",
            ReconnectionType: "Async/Models/ReconnectionType.Template.cs"
        },
        Threading: {
            AsyncLock: "Async/Threading/AsyncLock.Template.cs"
        },
        AsyncApi: "Async/AsyncApi.Template.cs",
        ConnectionStatus: "Async/ConnectionStatus.Template.cs",
        Query: "Async/Query.Template.cs",
        RequestMessage: "Async/RequestMessage.Template.cs",
        WebSocketConnection: "Async/WebSocketConnection.Template.cs",
        WebSocketConnectionSending: "Async/WebSocketConnection.Sending.Template.cs"
    },
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
            QueryParameterTests: "test/RawClientTests/QueryParameterTests.Template.cs",
            IdempotentHeadersTests: "test/RawClientTests/IdempotentHeadersTests.Template.cs"
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
