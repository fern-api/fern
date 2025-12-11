using SeedInferredAuthImplicitApiKey;

namespace SeedInferredAuthImplicitApiKey.Core;

public partial class InferredAuthTokenProvider
{
    private const double BufferInMinutes = 2;

    private AuthClient _client;

    private IDictionary<string, string>? _cachedHeaders;

    private DateTime? _expiresAt;

    private string _apiKey;

    public InferredAuthTokenProvider(string apiKey, AuthClient client)
    {
        _apiKey = apiKey;
        _client = client;
    }

    public async Task<IDictionary<string, string>> GetAuthHeadersAsync()
    {
        if (_cachedHeaders == null || DateTime.UtcNow >= _expiresAt)
        {
            var tokenResponse = await _client
                .GetTokenAsync(new GetTokenRequest { ApiKey = _apiKey })
                .ConfigureAwait(false);
            _cachedHeaders = new Dictionary<string, string>();
            _cachedHeaders["Authorization"] = $"Bearer {tokenResponse.AccessToken}";
            _expiresAt = DateTime
                .UtcNow.AddSeconds(tokenResponse.ExpiresIn)
                .AddMinutes(-BufferInMinutes);
        }
        return _cachedHeaders;
    }
}
