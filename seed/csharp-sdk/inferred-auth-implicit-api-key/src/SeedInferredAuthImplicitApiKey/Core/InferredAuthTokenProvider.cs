using SeedInferredAuthImplicitApiKey;

namespace SeedInferredAuthImplicitApiKey.Core;

public partial class InferredAuthTokenProvider
{
    private const double BufferInMinutes = 2;

    private AuthClient _client;

    private IDictionary<string, string>? _cachedHeaders;

    private DateTime? _expiresAt;

    private readonly SemaphoreSlim _lock = new SemaphoreSlim(1, 1);

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
            await _lock.WaitAsync().ConfigureAwait(false);
            try
            {
                if (_cachedHeaders == null || DateTime.UtcNow >= _expiresAt)
                {
                    try
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
