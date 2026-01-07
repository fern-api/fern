namespace SeedOauthClientCredentialsMandatoryAuth;

public partial interface IAuthClient
{
    Task<TokenResponse> GetTokenWithClientCredentialsAsync(
        GetTokenRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<TokenResponse> RefreshTokenAsync(
        RefreshTokenRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
