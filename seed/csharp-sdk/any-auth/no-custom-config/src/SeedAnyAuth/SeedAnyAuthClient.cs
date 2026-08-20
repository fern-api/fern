using SeedAnyAuth.Core;

namespace SeedAnyAuth;

public partial class SeedAnyAuthClient : ISeedAnyAuthClient
{
    private readonly RawClient _client;

    public SeedAnyAuthClient(
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
                { "X-Fern-SDK-Name", "SeedAnyAuth" },
                { "X-Fern-SDK-Version", global::SeedAnyAuth.Version.Current },
                { "User-Agent", "Fernany-auth/0.0.1" },
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
            clientOptionsWithAuth.Headers["Authorization"] = $"Bearer {token}";
        }
        if (apiKey != null)
        {
            clientOptionsWithAuth.Headers["X-API-Key"] = apiKey;
        }
        if (username != null && password != null)
        {
            clientOptionsWithAuth.Headers["Authorization"] =
                $"Basic {Convert.ToBase64String(global::System.Text.Encoding.UTF8.GetBytes($"{username}:{password}"))}";
        }
        if (clientId != null && clientSecret != null)
        {
            var tokenProvider = new OAuthTokenProvider(
                clientId,
                clientSecret,
                new AuthClient(new RawClient(clientOptions))
            );
            clientOptionsWithAuth.Headers["Authorization"] =
                new Func<global::System.Threading.Tasks.ValueTask<string>>(async () =>
                    await tokenProvider.GetAccessTokenAsync().ConfigureAwait(false)
                );
        }
        _client = new RawClient(clientOptionsWithAuth);
        Auth = new AuthClient(_client);
        User = new UserClient(_client);
    }

    public IAuthClient Auth { get; }

    public IUserClient User { get; }
}
