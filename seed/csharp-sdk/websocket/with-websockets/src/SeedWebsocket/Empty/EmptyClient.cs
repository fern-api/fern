using SeedWebsocket.Core;

namespace SeedWebsocket.Empty;

public partial class EmptyClient
{
    private RawClient _client;

    internal EmptyClient(RawClient client)
    {
        _client = client;
    }

    public EmptyRealtimeApi CreateEmptyRealtimeApi()
    {
        return new EmptyRealtimeApi(new EmptyRealtimeApi.Options());
    }

    public EmptyRealtimeApi CreateEmptyRealtimeApi(EmptyRealtimeApi.Options options)
    {
        return new EmptyRealtimeApi(options);
    }
}
