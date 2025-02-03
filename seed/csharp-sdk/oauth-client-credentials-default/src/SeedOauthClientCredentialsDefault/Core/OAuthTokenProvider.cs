using SeedOauthClientCredentialsDefault;

namespace SeedOauthClientCredentialsDefault.Core;

public partial class OAuthTokenProvider
{
    private const double BufferInMinutes = 2;

    private string? _accessToken;

    private string _clientId;

    private string _clientSecret;

    private AuthClient _client;

    public OAuthTokenProvider(string clientId, string clientSecret, AuthClient client)
    {
        _clientId = clientId;
        _clientSecret = clientSecret;
        _client = client;
    }

    public async Task<string> GetAccessTokenAsync()
    {
        if (_accessToken == null)
        {
            var tokenResponse = await _client
                .GetTokenAsync(
                    new GetTokenRequest { ClientId = _clientId, ClientSecret = _clientSecret }
                )
                .ConfigureAwait(false);
            _accessToken = tokenResponse.AccessToken;
        }
        return $"Bearer {_accessToken}";
    }
}
