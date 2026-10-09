using SeedEndpointSecurityAuth.Core;

namespace SeedEndpointSecurityAuth;

public partial class SeedEndpointSecurityAuthClient : ISeedEndpointSecurityAuthClient
{
    private readonly RawClient _client;

    public SeedEndpointSecurityAuthClient(
        string? token = null,
        string? apiKey = null,
        string? clientId = null,
        string? clientSecret = null,
        string? username = null,
        string? password = null,
        ClientOptions? clientOptions = null
    )
    {
        token ??= Environment.GetEnvironmentVariable("MY_TOKEN");
        apiKey ??= Environment.GetEnvironmentVariable("MY_API_KEY");
        clientId ??= Environment.GetEnvironmentVariable("MY_CLIENT_ID");
        clientSecret ??= Environment.GetEnvironmentVariable("MY_CLIENT_SECRET");
        username ??= Environment.GetEnvironmentVariable("MY_USERNAME");
        password ??= Environment.GetEnvironmentVariable("MY_PASSWORD");
        clientOptions ??= new ClientOptions();
        var platformHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedEndpointSecurityAuth" },
                { "X-Fern-SDK-Version", global::SeedEndpointSecurityAuth.Version.Current },
                { "User-Agent", "Fernendpoint-security-auth/0.0.1" },
            }
        );
        foreach (var header in platformHeaders)
        {
            if (!clientOptions.Headers.ContainsKey(header.Key))
            {
                clientOptions.Headers[header.Key] = header.Value;
            }
        }
        var clientOptionsWithAuth = clientOptions.Clone();
        if (token != null)
        {
            clientOptionsWithAuth.AuthHeaderSchemes["Bearer"] = new Headers(
                new Dictionary<string, string>() { { "Authorization", $"Bearer {token}" } }
            );
        }
        if (apiKey != null)
        {
            clientOptionsWithAuth.AuthHeaderSchemes["ApiKey"] = new Headers(
                new Dictionary<string, string>() { { "X-API-Key", apiKey } }
            );
        }
        if (clientId != null && clientSecret != null)
        {
            var tokenProvider = new OAuthTokenProvider(
                clientId,
                clientSecret,
                new AuthClient(new RawClient(clientOptions))
            );
            var oauthAuthHeaders = new Headers();
            oauthAuthHeaders["Authorization"] =
                new Func<global::System.Threading.Tasks.ValueTask<string>>(async () =>
                    await tokenProvider.GetAccessTokenAsync().ConfigureAwait(false)
                );
            clientOptionsWithAuth.AuthHeaderSchemes["OAuth"] = oauthAuthHeaders;
        }
        if (username != null && password != null)
        {
            clientOptionsWithAuth.AuthHeaderSchemes["Basic"] = new Headers(
                new Dictionary<string, string>()
                {
                    {
                        "Authorization",
                        $"Basic {Convert.ToBase64String(global::System.Text.Encoding.UTF8.GetBytes($"{username}:{password}"))}"
                    },
                }
            );
        }
        if (clientId != null && clientSecret != null)
        {
            var inferredAuthProvider = new InferredAuthTokenProvider(
                clientId,
                clientSecret,
                new AuthClient(new RawClient(clientOptions))
            );
            var inferredAuthHeaders = new Headers();
            inferredAuthHeaders["Authorization"] =
                new Func<global::System.Threading.Tasks.ValueTask<string>>(async () =>
                    (await inferredAuthProvider.GetAuthHeadersAsync().ConfigureAwait(false))
                        .First()
                        .Value
                );
            clientOptionsWithAuth.AuthHeaderSchemes["InferredAuth"] = inferredAuthHeaders;
        }
        _client = new RawClient(clientOptionsWithAuth);
        Auth = new AuthClient(_client);
        User = new UserClient(_client);
    }

    public IAuthClient Auth { get; }

    public IUserClient User { get; }
}
