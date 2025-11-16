using SeedOauthClientCredentials;

namespace SeedOauthClientCredentials.Core;

public partial class OAuthTokenProvider
{
    private const double BufferInMinutes = 2;

    private AuthClient _client;

    private string? _accessToken;

    private DateTime? _expiresAt;

    private string _clientId;

    private string _clientSecret;

    private string _entityId;

    private string _scp;

    public OAuthTokenProvider(
        string clientId,
        string clientSecret,
        string EntityId,
        string Scp,
        AuthClient client
    )
    {
        _clientId = clientId;
        _clientSecret = clientSecret;
        _entityId = EntityId;
        _scp = Scp;
        _client = client;
    }

    public async Task<string> GetAccessTokenAsync()
    {
        if (_accessToken == null || DateTime.UtcNow >= _expiresAt)
        {
            var tokenResponse = await _client
                .GetTokenWithClientCredentialsAsync(
                    new GetTokenRequest
                    {
                        Cid = _clientId,
                        Csr = _clientSecret,
                        EntityId = _entityId,
                        Scp = _scp,
                    }
                )
                .ConfigureAwait(false);
            _accessToken = tokenResponse.AccessToken;
            _expiresAt = DateTime
                .UtcNow.AddSeconds(tokenResponse.ExpiresIn)
                .AddMinutes(-BufferInMinutes);
        }
        return $"Bearer {_accessToken}";
    }
}
