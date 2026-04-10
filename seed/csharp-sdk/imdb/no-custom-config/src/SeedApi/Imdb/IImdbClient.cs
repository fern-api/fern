namespace SeedApi;

public partial interface IImdbClient
{
    /// <summary>
    /// Add a movie to the database using the movies/* /... path.
    /// </summary>
    WithRawResponseTask<string> CreatemovieAsync(
        CreateMovieRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<Movie> GetmovieAsync(
        ImdbGetMovieRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
