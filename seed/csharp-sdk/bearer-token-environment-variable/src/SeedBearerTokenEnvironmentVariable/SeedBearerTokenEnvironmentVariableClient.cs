using SeedBearerTokenEnvironmentVariable.Core;

namespace SeedBearerTokenEnvironmentVariable;

public partial class SeedBearerTokenEnvironmentVariableClient
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
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "Authorization", $"Bearer {apiKey}" },
                { "X-API-Version", "1.0.0" },
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedBearerTokenEnvironmentVariable" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernbearer-token-environment-variable/0.0.1" },
            }
        );
        if (clientOptions.Version != null)
        {
            defaultHeaders["X-API-Version"] = clientOptions.Version;
        }
        clientOptions ??= new ClientOptions();
        foreach (var header in defaultHeaders)
        {
            if (!clientOptions.Headers.ContainsKey(header.Key))
            {
                clientOptions.Headers[header.Key] = header.Value;
            }
        }
        _client = new RawClient(clientOptions);
        Service = new ServiceClient(_client);
    }

    public ServiceClient Service { get; init; }

    private static string GetFromEnvironmentOrThrow(string env, string message)
    {
        return Environment.GetEnvironmentVariable(env) ?? throw new Exception(message);
    }
}
