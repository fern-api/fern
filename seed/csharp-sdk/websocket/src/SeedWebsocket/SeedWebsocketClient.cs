using System;
using SeedWebsocket.Core;

#nullable enable

namespace SeedWebsocket;

internal partial class SeedWebsocketClient
{
    public SeedWebsocketClient(ClientOptions? clientOptions = null)
    {
        _client = new RawClient(
            new Dictionary<string, string>() { { "X-Fern-Language", "C#" }, },
            new Dictionary<string, Func<string>>() { },
            clientOptions ?? new ClientOptions()
        );
        Realtime = new RealtimeClient(_client);
    }

    public RawClient _client;

    public RealtimeClient Realtime { get; init; }
}
