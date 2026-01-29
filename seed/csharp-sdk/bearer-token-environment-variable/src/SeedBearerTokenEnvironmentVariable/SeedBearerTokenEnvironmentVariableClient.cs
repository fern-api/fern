using SeedBearerTokenEnvironmentVariable.Core;

namespace SeedBearerTokenEnvironmentVariable;

public partial class SeedBearerTokenEnvironmentVariableClient
    : ISeedBearerTokenEnvironmentVariableClient
{
    private readonly RawClient _client;

    public SeedBearerTokenEnvironmentVariableClient(
        string? apiKey = null,
        ClientOptions? clientOptions = null
    )
    {
        apiKey ??= GetFromEnvironmentOrThrow(
            "COURIER_API_KEY",
            "Please pass in apiKey or set the environment variable COURIER_API_KEY."
        );
        clientOptions ??= new ClientOptions();
        var platformHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedBearerTokenEnvironmentVariable" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernbearer-token-environment-variable/0.0.1" },
            }
        );
        if (clientOptions.Version != null)
        {
            platformHeaders["X-API-Version"] = clientOptions.Version;
        }
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
                { "Authorization", $"Bearer {apiKey ?? ""}" },
                { "X-API-Version", "1.0.0" },
            }
        );
        foreach (var header in authHeaders)
        {
            clientOptionsWithAuth.Headers[header.Key] = header.Value;
        }
        _client = new RawClient(clientOptionsWithAuth);
        Service = new ServiceClient(_client);
    }

    public ServiceClient Service { get; }

    private static string GetFromEnvironmentOrThrow(string env, string message)
    {
        return Environment.GetEnvironmentVariable(env) ?? throw new Exception(message);
    }
}
