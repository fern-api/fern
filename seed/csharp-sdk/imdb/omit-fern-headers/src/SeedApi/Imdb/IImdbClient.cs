namespace SeedApi;

public partial interface IImdbClient
{
    /// <summary>
    /// @beta This endpoint is in pre-release and may change.
    ///
    /// Add a movie to the database using the movies/* /... path.
    /// </summary>
    WithRawResponseTask<string> CreateMovieAsync(
        CreateMovieRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    [Obsolete]
    WithRawResponseTask<Movie> GetMovieAsync(
        string movieId,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
