using SeedWebsocket.Core;

namespace SeedWebsocket.Empty;

public partial class EmptyClient : IEmptyClient
{
    private readonly RawClient _client;

    internal EmptyClient(RawClient client)
    {
        _client = client;
    }

    public IEmptyRealtimeApi CreateEmptyRealtimeApi()
    {
        return new EmptyRealtimeApi(new EmptyRealtimeApi.Options());
    }

    public IEmptyRealtimeApi CreateEmptyRealtimeApi(EmptyRealtimeApi.Options options)
    {
        return new EmptyRealtimeApi(options);
    }
}
