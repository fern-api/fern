namespace SeedFileUpload;

public partial interface IServiceClient
{
    WithRawResponseTask PostAsync(
        MyRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask JustFileAsync(
        JustFileRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask JustFileWithQueryParamsAsync(
        JustFileWithQueryParamsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask JustFileWithOptionalQueryParamsAsync(
        JustFileWithOptionalQueryParamsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask WithContentTypeAsync(
        WithContentTypeRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask WithFormEncodingAsync(
        WithFormEncodingRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask WithFormEncodedContainersAsync(
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

    WithRawResponseTask<string> WithJsonPropertyAsync(
        WithJsonPropertyRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<string> WithRefBodyAsync(
        WithRefBodyRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask SimpleAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<string> WithLiteralAndEnumTypesAsync(
        LiteralEnumRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
