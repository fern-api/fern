using SeedWebsocketBearerAuth.Core;

namespace SeedWebsocketBearerAuth;

public partial class SeedWebsocketBearerAuthClient : ISeedWebsocketBearerAuthClient
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
                { "Authorization", $"Bearer {apiKey ?? ""}" },
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
        Raw = new RawAccessClient(_client);
    }

    public SeedWebsocketBearerAuthClient.RawAccessClient Raw { get; }

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

        private static IReadOnlyDictionary<string, IEnumerable<string>> ExtractHeaders(
            HttpResponseMessage response
        )
        {
            var headers = new Dictionary<string, IEnumerable<string>>(
                StringComparer.OrdinalIgnoreCase
            );
            foreach (var header in response.Headers)
            {
                headers[header.Key] = header.Value.ToList();
            }
            if (response.Content != null)
            {
                foreach (var header in response.Content.Headers)
                {
                    headers[header.Key] = header.Value.ToList();
                }
            }
            return headers;
        }
    }
}
