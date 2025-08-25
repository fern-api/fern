using SeedWebsocketBearerAuth.Core;

namespace SeedWebsocketBearerAuth;

public partial class SeedWebsocketBearerAuthClient
{
    private readonly RawClient _client;

    public SeedWebsocketBearerAuthClient(string? apiKey = null, ClientOptions? clientOptions = null)
    {
        apiKey ??= GetFromEnvironmentOrThrow(
            "SEED_API_KEY",
            "Please pass in apiKey or set the environment variable SEED_API_KEY."
        );
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "Authorization", $"Bearer {apiKey}" },
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedWebsocketBearerAuth" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernwebsocket-bearer-auth/0.0.1" },
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
    }

    private static string GetFromEnvironmentOrThrow(string env, string message)
    {
        return Environment.GetEnvironmentVariable(env) ?? throw new Exception(message);
    }
}
