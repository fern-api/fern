using SeedWebsocketAuth;

namespace SeedWebsocketAuth.Core;

public partial class InferredAuthTokenProvider
{
    private const double BufferInMinutes = 2;

    private AuthClient _client;

    private IDictionary<string, string>? _cachedHeaders;

    private string _xApiKey;

    private string _clientId;

    private string _clientSecret;

    private string? _scope;

    public InferredAuthTokenProvider(
        string xApiKey,
        string clientId,
        string clientSecret,
        string? scope,
        AuthClient client
    )
    {
        _xApiKey = xApiKey;
        _clientId = clientId;
        _clientSecret = clientSecret;
        _scope = scope;
        _client = client;
    }

    public async Task<IDictionary<string, string>> GetAuthHeadersAsync()
    {
        if (_cachedHeaders == null)
        {
            var tokenResponse = await _client
                .GetTokenWithClientCredentialsAsync(
                    new GetTokenRequest
                    {
                        XApiKey = _xApiKey,
                        ClientId = _clientId,
                        ClientSecret = _clientSecret,
                        Scope = _scope,
                    }
                )
                .ConfigureAwait(false);
            _cachedHeaders = new Dictionary<string, string>();
            _cachedHeaders["Authorization"] = $"Bearer {tokenResponse.AccessToken}";
        }
        return _cachedHeaders;
    }
}
