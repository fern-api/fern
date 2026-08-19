namespace SeedApi;

public partial interface ISeedApiClient
{
    /// <summary>
    /// Returns a RootObject which inherits from a nullable schema.
    /// </summary>
    WithRawResponseTask<RootObject> GetTestAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Creates a test object with nullable allOf in request body.
    /// </summary>
    WithRawResponseTask<RootObject> CreateTestAsync(
        RootObject request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
