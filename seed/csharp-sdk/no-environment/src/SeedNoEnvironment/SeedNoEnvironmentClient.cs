using SeedNoEnvironment.Core;

namespace SeedNoEnvironment;

public partial class SeedNoEnvironmentClient : ISeedNoEnvironmentClient
{
    private readonly RawClient _client;

    public SeedNoEnvironmentClient(string? token = null, ClientOptions? clientOptions = null)
    {
        clientOptions ??= new ClientOptions();
        var platformHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedNoEnvironment" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernno-environment/0.0.1" },
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
            new Dictionary<string, string>() { { "Authorization", $"Bearer {token ?? ""}" } }
        );
        foreach (var header in authHeaders)
        {
            clientOptionsWithAuth.Headers[header.Key] = header.Value;
        }
        _client = new RawClient(clientOptionsWithAuth);
        Dummy = new DummyClient(_client);
    }

    public DummyClient Dummy { get; }
}
