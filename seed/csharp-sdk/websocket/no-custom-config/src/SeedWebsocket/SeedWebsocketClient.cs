using SeedWebsocket.Core;

namespace SeedWebsocket;

public partial class SeedWebsocketClient : ISeedWebsocketClient
{
    private readonly RawClient _client;

    public SeedWebsocketClient(ClientOptions? clientOptions = null)
    {
        clientOptions ??= new ClientOptions();
        var platformHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedWebsocket" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernwebsocket/0.0.1" },
            }
        );
        foreach (var header in platformHeaders)
        {
            if (!clientOptions.Headers.ContainsKey(header.Key))
            {
                clientOptions.Headers[header.Key] = header.Value;
            }
        }
        _client = new RawClient(clientOptions);
    }
}
