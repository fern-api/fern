namespace SeedHeaderToken;

public partial interface IServiceClient
{
    /// <summary>
    /// GET request with custom api key
    /// </summary>
    Task<string> GetWithBearerTokenAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
