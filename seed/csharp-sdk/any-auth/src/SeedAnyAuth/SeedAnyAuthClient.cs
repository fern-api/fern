using SeedAnyAuth.Core;

namespace SeedAnyAuth;

public partial class SeedAnyAuthClient : ISeedAnyAuthClient
{
    private readonly RawClient _client;

    public SeedAnyAuthClient(
        string clientId,
        string clientSecret,
        string? token = null,
        string? apiKey = null,
        string? clientId = null,
        string? clientSecret = null,
        string? username = null,
        string? password = null,
        ClientOptions? clientOptions = null
    )
    {
        token ??= GetFromEnvironmentOrThrow(
            "MY_TOKEN",
            "Please pass in token or set the environment variable MY_TOKEN."
        );
        apiKey ??= GetFromEnvironmentOrThrow(
            "MY_API_KEY",
            "Please pass in apiKey or set the environment variable MY_API_KEY."
        );
        clientId ??= GetFromEnvironmentOrThrow(
            "MY_CLIENT_ID",
            "Please pass in clientId or set the environment variable MY_CLIENT_ID."
        );
        clientSecret ??= GetFromEnvironmentOrThrow(
            "MY_CLIENT_SECRET",
            "Please pass in clientSecret or set the environment variable MY_CLIENT_SECRET."
        );
        username ??= GetFromEnvironmentOrThrow(
            "MY_USERNAME",
            "Please pass in username or set the environment variable MY_USERNAME."
        );
        password ??= GetFromEnvironmentOrThrow(
            "MY_PASSWORD",
            "Please pass in password or set the environment variable MY_PASSWORD."
        );
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "Authorization", $"Bearer {token}" },
                { "X-API-Key", apiKey },
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedAnyAuth" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernany-auth/0.0.1" },
            }
        );
        clientOptions ??= new ClientOptions();
        foreach (var header in defaultHeaders)
        {
            if (!clientOptions.Headers.ContainsKey(header.Key))
            {
                clientOptions.Headers[header.Key] = header.Value;
            }
        }
        var inferredAuthProvider = new InferredAuthTokenProvider(
            clientId,
            clientSecret,
            new AuthClient(new RawClient(clientOptions.Clone()))
        );
        clientOptions.Headers["Authorization"] =
            new Func<global::System.Threading.Tasks.ValueTask<string>>(async () =>
                (await inferredAuthProvider.GetAuthHeadersAsync().ConfigureAwait(false))
                    .First()
                    .Value
            );
        _client = new RawClient(clientOptions);
        Auth = new AuthClient(_client);
        User = new UserClient(_client);
        Raw = new RawAccessClient(_client);
    }

    public AuthClient Auth { get; }

    public UserClient User { get; }

    public SeedAnyAuthClient.RawAccessClient Raw { get; }

    private static string GetFromEnvironmentOrThrow(string env, string message)
    {
        return Environment.GetEnvironmentVariable(env) ?? throw new Exception(message);
    }

    public partial class RawAccessClient
    {
        private readonly RawClient _client;

        internal RawAccessClient(RawClient client)
        {
            _client = client;
        }
    }
}
