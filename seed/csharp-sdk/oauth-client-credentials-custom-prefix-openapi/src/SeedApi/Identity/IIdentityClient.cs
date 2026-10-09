namespace SeedApi;

public partial interface IIdentityClient
{
    WithRawResponseTask<TokenResponse> GetTokenAsync(
        GetTokenIdentityRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
