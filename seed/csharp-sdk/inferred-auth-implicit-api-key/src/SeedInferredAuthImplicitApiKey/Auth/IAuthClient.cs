namespace SeedInferredAuthImplicitApiKey;

public partial interface IAuthClient
{
    Task<TokenResponse> GetTokenAsync(
        GetTokenRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
