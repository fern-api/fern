using SeedApi;

namespace SeedApi.Core;

public partial class OAuthTokenProvider
{
    private const double BufferInMinutes = 2;

    private AuthClient _client;

    private string? _accessToken;

    private DateTime? _expiresAt;

    private string _clientId;

    private string _clientSecret;

    private string _tenant;

    private string _scopes;

    public OAuthTokenProvider(
        string clientId,
        string clientSecret,
        string Tenant,
        string Scopes,
        AuthClient client
    )
    {
        _clientId = clientId;
        _clientSecret = clientSecret;
        _tenant = Tenant;
        _scopes = Scopes;
        _client = client;
    }

    public async Task<string> GetAccessTokenAsync()
    {
        if (_accessToken == null || DateTime.UtcNow >= _expiresAt)
        {
            var tokenResponse = await _client
                .GetTokenAsync(
                    new GetTokenAuthRequest
                    {
                        ClientId = _clientId,
                        ClientSecret = _clientSecret,
                        GrantType = "client_credentials",
                        Tenant = _tenant,
                        Scopes = _scopes,
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
