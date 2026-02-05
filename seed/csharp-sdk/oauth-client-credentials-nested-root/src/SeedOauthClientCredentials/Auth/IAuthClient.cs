using SeedOauthClientCredentials;

namespace SeedOauthClientCredentials.Auth;

public partial interface IAuthClient
{
    WithRawResponseTask<TokenResponse> GetTokenAsync(
        GetTokenRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
