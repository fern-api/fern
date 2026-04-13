namespace SeedApi;

public partial interface IAuthClient
{
    WithRawResponseTask<TokenResponse> GettokenwithclientcredentialsAsync(
        GetTokenRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<TokenResponse> RefreshtokenAsync(
        RefreshTokenRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
