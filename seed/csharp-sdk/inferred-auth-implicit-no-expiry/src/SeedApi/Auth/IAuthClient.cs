namespace SeedApi;

public partial interface IAuthClient
{
    WithRawResponseTask<TokenResponse> GettokenwithclientcredentialsAsync(
        AuthGetTokenWithClientCredentialsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<TokenResponse> RefreshtokenAsync(
        AuthRefreshTokenRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
