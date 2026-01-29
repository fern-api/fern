using SeedHeaderTokenEnvironmentVariable.Core;

namespace SeedHeaderTokenEnvironmentVariable;

public partial class SeedHeaderTokenEnvironmentVariableClient
    : ISeedHeaderTokenEnvironmentVariableClient
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
        clientOptions ??= new ClientOptions();
        var platformHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedHeaderTokenEnvironmentVariable" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernheader-auth-environment-variable/0.0.1" },
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
                { "x-api-key", $"test_prefix {headerTokenAuth ?? ""}" },
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
