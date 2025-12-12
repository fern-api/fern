using SeedInferredAuthExplicit;

namespace SeedInferredAuthExplicit.Core;

public partial class InferredAuthTokenProvider
{
    private const double BufferInMinutes = 2;

    private AuthClient _client;

    private IDictionary<string, string>? _cachedHeaders;

    private DateTime? _expiresAt;

    private readonly SemaphoreSlim _lock = new SemaphoreSlim(1, 1);

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
