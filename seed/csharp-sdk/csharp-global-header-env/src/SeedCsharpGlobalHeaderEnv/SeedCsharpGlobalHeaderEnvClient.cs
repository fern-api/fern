using SeedCsharpGlobalHeaderEnv.Core;

namespace SeedCsharpGlobalHeaderEnv;

public partial class SeedCsharpGlobalHeaderEnvClient : ISeedCsharpGlobalHeaderEnvClient
{
    private readonly RawClient _client;

    public SeedCsharpGlobalHeaderEnvClient(
        string? username = null,
        string? password = null,
        string? token = null,
        string? version = null,
        ClientOptions? clientOptions = null
    )
    {
        username ??= Environment.GetEnvironmentVariable("MY_USERNAME");
        password ??= Environment.GetEnvironmentVariable("MY_PASSWORD");
        token ??= Environment.GetEnvironmentVariable("MY_TOKEN");
        version ??= Environment.GetEnvironmentVariable("MY_API_VERSION") ?? "2024-01-01";
        clientOptions ??= new ClientOptions();
        var platformHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedCsharpGlobalHeaderEnv" },
                { "X-Fern-SDK-Version", global::SeedCsharpGlobalHeaderEnv.Version.Current },
                { "User-Agent", "Ferncsharp-global-header-env/0.0.1" },
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
        if (token != null)
        {
            clientOptionsWithAuth.Headers["Authorization"] = $"Bearer {token}";
        }
        if (version != null)
        {
            clientOptionsWithAuth.Headers["X-API-Version"] = version;
        }
        if (username != null && password != null)
        {
            clientOptionsWithAuth.Headers["Authorization"] =
                $"Basic {Convert.ToBase64String(global::System.Text.Encoding.UTF8.GetBytes($"{username}:{password}"))}";
        }
        _client = new RawClient(clientOptionsWithAuth);
        Service = new ServiceClient(_client);
    }

    public IServiceClient Service { get; }
}
