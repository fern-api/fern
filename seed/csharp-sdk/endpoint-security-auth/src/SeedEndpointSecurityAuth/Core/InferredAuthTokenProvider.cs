using SeedEndpointSecurityAuth;

namespace SeedEndpointSecurityAuth.Core;

internal partial class InferredAuthTokenProvider
{
    private const double BufferInMinutes = 2;

    private AuthClient _client;

    private IDictionary<string, string>? _cachedHeaders;

    private DateTime? _expiresAt;

    private readonly SemaphoreSlim _lock = new SemaphoreSlim(1, 1);

    private string _clientId;

    private string _clientSecret;

    internal InferredAuthTokenProvider(string clientId, string clientSecret, AuthClient client)
    {
        _clientId = clientId;
        _clientSecret = clientSecret;
        _client = client;
    }

    internal async Task<IDictionary<string, string>> GetAuthHeadersAsync()
    {
        if (_cachedHeaders == null || DateTime.UtcNow >= _expiresAt)
        {
            await _lock.WaitAsync().ConfigureAwait(false);
            try
            {
                if (_cachedHeaders == null || DateTime.UtcNow >= _expiresAt)
                {
                    try
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
                        _cachedHeaders = new Dictionary<string, string>();
                        _cachedHeaders["Authorization"] = $"Bearer {tokenResponse.AccessToken}";
                        _expiresAt = DateTime
                            .UtcNow.AddSeconds(tokenResponse.ExpiresIn)
                            .AddMinutes(-BufferInMinutes);
                    }
                    catch
                    {
                        _cachedHeaders = null;
                        _expiresAt = null;
                        throw;
                    }
                }
            }
            finally
            {
                _lock.Release();
            }
        }
        return _cachedHeaders;
    }
}
