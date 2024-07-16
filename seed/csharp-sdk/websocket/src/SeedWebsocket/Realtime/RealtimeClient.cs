using SeedWebsocket.Core;

#nullable enable

namespace SeedWebsocket;

public class RealtimeClient
{
    private RawClient _client;

    public RealtimeClient(RawClient client)
    {
        _client = client;
    }
}
