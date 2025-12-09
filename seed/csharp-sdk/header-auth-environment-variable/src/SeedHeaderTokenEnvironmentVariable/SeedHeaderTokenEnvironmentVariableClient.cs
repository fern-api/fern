using SeedHeaderTokenEnvironmentVariable.Core;

namespace SeedHeaderTokenEnvironmentVariable;

public partial class SeedHeaderTokenEnvironmentVariableClient
{
    private readonly RawClient _client;

    public SeedHeaderTokenEnvironmentVariableClient(
        string? headerTokenAuth = null,
        ClientOptions? clientOptions = null
    )
    {
        headerTokenAuth ??= GetFromEnvironmentOrThrow(
            "HEADER_TOKEN_ENV_VAR",
            "Please pass in headerTokenAuth or set the environment variable HEADER_TOKEN_ENV_VAR."
        );
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "x-api-key", $"test_prefix {headerTokenAuth ?? ""}" },
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedHeaderTokenEnvironmentVariable" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernheader-auth-environment-variable/0.0.1" },
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
        Service = new ServiceClient(_client);
    }

    public ServiceClient Service { get; }

    private static string GetFromEnvironmentOrThrow(string env, string message)
    {
        return Environment.GetEnvironmentVariable(env) ?? throw new Exception(message);
    }
}
