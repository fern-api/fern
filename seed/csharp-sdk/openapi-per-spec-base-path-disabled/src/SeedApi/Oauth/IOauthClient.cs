using SeedApi;

namespace SeedApi.Oauth;

public partial interface IOauthClient
{
    WithRawResponseTask<GetTokenResponse> GetTokenAsync(
        GetTokenRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
