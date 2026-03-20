using SeedWebsocket.Empty;

namespace SeedWebsocket;

public partial interface ISeedWebsocketClient
{
    public IEmptyClient Empty { get; }
    IRealtimeApi CreateRealtimeApi(RealtimeApi.Options options);
}
