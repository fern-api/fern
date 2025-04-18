using SeedAnyAuth.Core;

namespace SeedAnyAuth;

public partial class SeedAnyAuthClient
{
    private readonly RawClient _client;

    public SeedAnyAuthClient(
        string? token = null,
        string? apiKey = null,
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
        _client = new RawClient(clientOptions);
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
