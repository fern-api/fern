namespace SeedApi;

public partial interface IServiceClient
{
    WithRawResponseTask<Movie> GetmovieAsync(
        ServiceGetMovieRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<string> CreatemovieAsync(
        Movie request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<Metadata> GetmetadataAsync(
        ServiceGetMetadataRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<Response> CreatebigentityAsync(
        BigEntity request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task RefreshtokenAsync(
        RefreshTokenRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
