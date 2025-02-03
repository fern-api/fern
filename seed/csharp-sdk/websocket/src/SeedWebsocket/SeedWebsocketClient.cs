using SeedWebsocket.Core;

namespace SeedWebsocket;

public partial class SeedWebsocketClient
{
    private readonly RawClient _client;

    public SeedWebsocketClient(ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedWebsocket" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernwebsocket/0.0.1" },
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
        Realtime = new RealtimeClient(_client);
    }

    public RealtimeClient Realtime { get; init; }
}
