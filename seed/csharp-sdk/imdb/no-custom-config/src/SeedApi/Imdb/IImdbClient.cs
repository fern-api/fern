namespace SeedApi;

public partial interface IImdbClient
{
    /// <summary>
    /// Add a movie to the database using the movies/* /... path.
    /// </summary>
    Task<string> CreateMovieAsync(
        CreateMovieRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<Movie> GetMovieAsync(
        string movieId,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
