using global::System.Diagnostics.CodeAnalysis;

namespace SeedApi;

public partial interface IImdbClient
{
    /// <summary>
    /// Add a movie to the database using the movies/* /... path.
    /// </summary>
    [global::System.Diagnostics.CodeAnalysis.Experimental("SEEDAP0002")]
    WithRawResponseTask<string> CreateMovieAsync(
        CreateMovieRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    [global::System.Obsolete]
    WithRawResponseTask<Movie> GetMovieAsync(
        string movieId,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
