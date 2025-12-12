using SeedInferredAuthImplicitNoExpiry;

namespace SeedInferredAuthImplicitNoExpiry.Core;

public partial class InferredAuthTokenProvider
{
    private AuthClient _client;

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
        var headers = new Dictionary<string, string>();
        headers["Authorization"] = $"Bearer {tokenResponse.AccessToken}";
        return headers;
    }
}
