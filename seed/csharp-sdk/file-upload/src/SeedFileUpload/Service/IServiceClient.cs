namespace SeedFileUpload;

public partial interface IServiceClient
{
    Task PostAsync(
        MyRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task JustFileAsync(
        JustFileRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task JustFileWithQueryParamsAsync(
        JustFileWithQueryParamsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task JustFileWithOptionalQueryParamsAsync(
        JustFileWithOptionalQueryParamsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task WithContentTypeAsync(
        WithContentTypeRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task WithFormEncodingAsync(
        WithFormEncodingRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task WithFormEncodedContainersAsync(
        MyOtherRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<string> OptionalArgsAsync(
        OptionalArgsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<string> WithInlineTypeAsync(
        InlineTypeRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task SimpleAsync(RequestOptions? options = null, CancellationToken cancellationToken = default);
}
