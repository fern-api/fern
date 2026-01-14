namespace SeedApi;

public partial interface ISeedApiClient
{
    /// <summary>
    /// Returns a RootObject which inherits from a nullable schema.
    /// </summary>
    Task<RootObject> GetTestAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Creates a test object with nullable allOf in request body.
    /// </summary>
    Task<RootObject> CreateTestAsync(
        RootObject request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
