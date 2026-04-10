namespace SeedApi;

public partial interface IServiceClient
{
    WithRawResponseTask<Response> GetmovieAsync(
        string request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<Response> GetmoviedocsAsync(
        string request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<StringResponse> GetmovienameAsync(
        string request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<Response> GetmoviemetadataAsync(
        string request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<Response> GetoptionalmovieAsync(
        string request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<WithDocs> GetoptionalmoviedocsAsync(
        string request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<StringResponse> GetoptionalmovienameAsync(
        string request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
