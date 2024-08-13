using SeedWebsocket.Core;

#nullable enable

namespace SeedWebsocket;

public partial class RealtimeClient
{
    private RawClient _client;

    internal RealtimeClient(RawClient client)
    {
        _client = client;
    }
}
