using SeedOauthClientCredentials;

#nullable enable

namespace SeedOauthClientCredentials.Core;

public partial class OAuthTokenProvider
{
    private const double BufferInMinutes = 2;

    private string? _accessToken;

    private DateTime? _expiresAt;

    private string _clientId;

    private string _clientSecret;

    public OAuthTokenProvider(string clientId, string clientSecret, AuthClient client)
    {
        _clientId = clientId;
        _clientSecret = clientSecret;
        _client = client;
    }

    public async Task<string> GetAccessTokenAsync()
    {
        if (_accessToken == null || DateTime.UtcNow >= _expiresAt)
        {
            var tokenResponse = await client.GetTokenWithClientCredentials(
                new GetTokenRequest { client_id = _clientId, client_secret = _clientId }
            );
            _accessToken = tokenResponse.AccessToken;
            _expiresAt = DateTime
                .UtcNow.AddSeconds(tokenResponse.ExpiresIn)
                .AddMinutes(-BufferInMinutes);
        }
        return $"Bearer _accessToken";
    }
}
