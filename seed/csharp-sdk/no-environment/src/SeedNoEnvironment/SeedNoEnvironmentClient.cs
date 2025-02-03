using SeedNoEnvironment.Core;

namespace SeedNoEnvironment;

public partial class SeedNoEnvironmentClient
{
    private readonly RawClient _client;

    public SeedNoEnvironmentClient(string? token = null, ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "Authorization", $"Bearer {token}" },
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedNoEnvironment" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernno-environment/0.0.1" },
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
        Dummy = new DummyClient(_client);
    }

    public DummyClient Dummy { get; init; }
}
