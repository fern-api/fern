namespace SeedCsharpOauthTokenOptional;

public partial interface IAuthClient
{
    WithRawResponseTask<TokenResponse> CreateOauth2TokenAsync(
        CreateOauth2TokenRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
