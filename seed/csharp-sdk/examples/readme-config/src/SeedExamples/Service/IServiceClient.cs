namespace SeedExamples;

public partial interface IServiceClient
{
    WithRawResponseTask<Movie> GetMovieAsync(
        string movieId,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<string> CreateMovieAsync(
        Movie request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<Metadata> GetMetadataAsync(
        GetMetadataRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<Response> CreateBigEntityAsync(
        BigEntity request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task RefreshTokenAsync(
        RefreshTokenRequest? request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
