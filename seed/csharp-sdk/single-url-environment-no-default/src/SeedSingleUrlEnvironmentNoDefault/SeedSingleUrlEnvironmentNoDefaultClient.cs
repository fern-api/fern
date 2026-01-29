using SeedSingleUrlEnvironmentNoDefault.Core;

namespace SeedSingleUrlEnvironmentNoDefault;

public partial class SeedSingleUrlEnvironmentNoDefaultClient
    : ISeedSingleUrlEnvironmentNoDefaultClient
{
    private readonly RawClient _client;

    public SeedSingleUrlEnvironmentNoDefaultClient(
        string? token = null,
        ClientOptions? clientOptions = null
    )
    {
        clientOptions ??= new ClientOptions();
        var platformHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedSingleUrlEnvironmentNoDefault" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernsingle-url-environment-no-default/0.0.1" },
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
