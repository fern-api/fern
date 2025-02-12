using SeedWebsocket.Core;

namespace SeedWebsocket;

public partial class RealtimeClient
{
    private RawClient _client;

    internal RealtimeClient(RawClient client)
    {
        _client = client;
    }
}
