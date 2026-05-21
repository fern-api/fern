namespace SeedApi;

public partial interface IImdbClient
{
    /// <summary>
    /// Add a movie to the database using the movies/* /... path.
    /// </summary>
    WithRawResponseTask<string> CreateMovieAsync(
        CreateMovieRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<Movie> GetMovieAsync(
        GetMovieImdbRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
