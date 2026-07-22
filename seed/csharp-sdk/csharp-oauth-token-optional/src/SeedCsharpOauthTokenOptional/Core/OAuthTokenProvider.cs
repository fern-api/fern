using SeedCsharpOauthTokenOptional;

namespace SeedCsharpOauthTokenOptional.Core;

public partial class OAuthTokenProvider
{
    private const double BufferInMinutes = 2;

    private AuthClient _client;

    private string? _accessToken;

    private DateTime? _expiresAt;

    private readonly SemaphoreSlim _lock = new SemaphoreSlim(1, 1);

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
            await _lock.WaitAsync().ConfigureAwait(false);
            try
            {
                if (_accessToken == null || DateTime.UtcNow >= _expiresAt)
                {
                    var tokenResponse = await _client
                        .CreateOauth2TokenAsync(
                            new CreateOauth2TokenRequest
                            {
                                ClientId = _clientId,
                                ClientSecret = _clientSecret,
                                GrantType = "client_credentials",
                            }
                        )
                        .ConfigureAwait(false);
                    _accessToken = tokenResponse.AccessToken;
                    _expiresAt = tokenResponse.ExpiresIn is { } expiresIn
                        ? DateTime.UtcNow.AddSeconds(expiresIn).AddMinutes(-BufferInMinutes)
                        : null;
                }
            }
            finally
            {
                _lock.Release();
            }
        }
        return $"Bearer {_accessToken}";
    }
}
