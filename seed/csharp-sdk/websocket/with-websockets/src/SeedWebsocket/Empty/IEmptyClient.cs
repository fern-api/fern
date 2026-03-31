namespace SeedWebsocket.Empty;

public partial interface IEmptyClient
{
    IEmptyRealtimeApi CreateEmptyRealtimeApi();

    IEmptyRealtimeApi CreateEmptyRealtimeApi(EmptyRealtimeApi.Options options);
}
