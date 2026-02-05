namespace SeedResponseProperty;

public partial interface IServiceClient
{
    WithRawResponseTask<Response> GetMovieAsync(
        string request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<Response> GetMovieDocsAsync(
        string request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<StringResponse> GetMovieNameAsync(
        string request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<Response> GetMovieMetadataAsync(
        string request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<Response?> GetOptionalMovieAsync(
        string request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<WithDocs?> GetOptionalMovieDocsAsync(
        string request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<StringResponse?> GetOptionalMovieNameAsync(
        string request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
