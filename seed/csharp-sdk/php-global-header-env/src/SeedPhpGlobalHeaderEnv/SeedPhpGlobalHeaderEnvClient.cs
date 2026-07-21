using SeedPhpGlobalHeaderEnv.Core;

namespace SeedPhpGlobalHeaderEnv;

public partial class SeedPhpGlobalHeaderEnvClient : ISeedPhpGlobalHeaderEnvClient
{
    private readonly RawClient _client;

    public SeedPhpGlobalHeaderEnvClient(string? version = null, ClientOptions? clientOptions = null)
    {
        version ??= Environment.GetEnvironmentVariable("MY_API_VERSION");
        clientOptions ??= new ClientOptions();
        var platformHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedPhpGlobalHeaderEnv" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernphp-global-header-env/0.0.1" },
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
            new Dictionary<string, string>() { { "X-API-Version", version ?? "" } }
        );
        foreach (var header in authHeaders)
        {
            clientOptionsWithAuth.Headers[header.Key] = header.Value;
        }
        _client = new RawClient(clientOptionsWithAuth);
        Service = new ServiceClient(_client);
    }

    public IServiceClient Service { get; }
}
