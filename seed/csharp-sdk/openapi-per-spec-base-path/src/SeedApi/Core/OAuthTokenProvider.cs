using SeedApi.Oauth;

namespace SeedApi.Core;

public partial class OAuthTokenProvider
{
    private const double BufferInMinutes = 2;

    private OauthClient _client;

    private string? _accessToken;

    private DateTime? _expiresAt;

    private readonly SemaphoreSlim _lock = new SemaphoreSlim(1, 1);

    private string _clientId;

    private string _clientSecret;

    public OAuthTokenProvider(string clientId, string clientSecret, OauthClient client)
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
                        .GetTokenAsync(
                            new GetTokenRequest
                            {
                                ClientId = _clientId,
                                ClientSecret = _clientSecret,
                            }
                        )
                        .ConfigureAwait(false);
                    _accessToken = tokenResponse.AccessToken;
                    _expiresAt = DateTime
                        .UtcNow.AddSeconds(tokenResponse.ExpiresIn)
                        .AddMinutes(-BufferInMinutes);
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
