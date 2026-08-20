using SeedCsharpGlobalHeaderLiteralEnv.Core;

namespace SeedCsharpGlobalHeaderLiteralEnv;

public partial class SeedCsharpGlobalHeaderLiteralEnvClient
    : ISeedCsharpGlobalHeaderLiteralEnvClient
{
    private readonly RawClient _client;

    public SeedCsharpGlobalHeaderLiteralEnvClient(
        string? token = null,
        string? Version = null,
        ClientOptions? clientOptions = null
    )
    {
        token ??= GetFromEnvironmentOrThrow(
            "SQUARE_TOKEN",
            "Please pass in token or set the environment variable SQUARE_TOKEN."
        );
        Version ??= clientOptions?.Version;
        Version ??= Environment.GetEnvironmentVariable("VERSION") ?? "2026-07-15";
        clientOptions ??= new ClientOptions();
        var platformHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedCsharpGlobalHeaderLiteralEnv" },
                { "X-Fern-SDK-Version", global::SeedCsharpGlobalHeaderLiteralEnv.Version.Current },
                { "User-Agent", "Ferncsharp-global-header-literal-env/0.0.1" },
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
                { "Authorization", $"Bearer {token ?? ""}" },
                { "Square-Version", Version ?? "2026-07-15" },
            }
        );
        foreach (var header in authHeaders)
        {
            clientOptionsWithAuth.Headers[header.Key] = header.Value;
        }
        _client = new RawClient(clientOptionsWithAuth);
        Service = new ServiceClient(_client);
    }

    public IServiceClient Service { get; }

    private static string GetFromEnvironmentOrThrow(string env, string message)
    {
        return Environment.GetEnvironmentVariable(env) ?? throw new Exception(message);
    }
}
