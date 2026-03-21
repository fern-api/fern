namespace SeedWebsocketOauth;

public partial interface IAuthClient
{
    WithRawResponseTask<TokenResponse> GetTokenWithClientCredentialsAsync(
        GetTokenRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
