namespace SeedApi;

public partial interface IServiceClient
{
    Task PostAsync(
        ServicePostRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task JustfileAsync(
        ServiceJustFileRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task JustfilewithqueryparamsAsync(
        ServiceJustFileWithQueryParamsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task JustfilewithoptionalqueryparamsAsync(
        ServiceJustFileWithOptionalQueryParamsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task WithcontenttypeAsync(
        ServiceWithContentTypeRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task WithformencodingAsync(
        ServiceWithFormEncodingRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task WithformencodedcontainersAsync(
        ServiceWithFormEncodedContainersRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<string> OptionalargsAsync(
        ServiceOptionalArgsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<string> WithinlinetypeAsync(
        ServiceWithInlineTypeRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<string> WithjsonpropertyAsync(
        ServiceWithJsonPropertyRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task SimpleAsync(RequestOptions? options = null, CancellationToken cancellationToken = default);

    WithRawResponseTask<string> WithliteralandenumtypesAsync(
        ServiceWithLiteralAndEnumTypesRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
