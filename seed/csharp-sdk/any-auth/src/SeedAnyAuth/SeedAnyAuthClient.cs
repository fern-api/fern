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
        clientOptions ??= new ClientOptions();
        var platformHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedAnyAuth" },
                { "X-Fern-SDK-Version", Version.Current },
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
        var authHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "Authorization", $"Bearer {token}" },
                { "X-API-Key", apiKey },
            }
        );
        foreach (var header in authHeaders)
        {
            clientOptionsWithAuth.Headers[header.Key] = header.Value;
        }
        var inferredAuthProvider = new InferredAuthTokenProvider(
            clientId,
            clientSecret,
            new AuthClient(new RawClient(clientOptions))
        );
        clientOptionsWithAuth.Headers["Authorization"] =
            new Func<global::System.Threading.Tasks.ValueTask<string>>(async () =>
                (await inferredAuthProvider.GetAuthHeadersAsync().ConfigureAwait(false))
                    .First()
                    .Value
            );
        _client = new RawClient(clientOptionsWithAuth);
        Auth = new AuthClient(_client);
        User = new UserClient(_client);
    }

    public AuthClient Auth { get; }

    public UserClient User { get; }

    private static string GetFromEnvironmentOrThrow(string env, string message)
    {
        return Environment.GetEnvironmentVariable(env) ?? throw new Exception(message);
    }
}
