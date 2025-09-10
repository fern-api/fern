using SeedEmptyClients.Core;

namespace SeedEmptyClients;

public partial class SeedEmptyClientsClient
{
    private readonly RawClient _client;

    public SeedEmptyClientsClient(ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedEmptyClients" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernempty-clients/0.0.1" },
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
    }
}
