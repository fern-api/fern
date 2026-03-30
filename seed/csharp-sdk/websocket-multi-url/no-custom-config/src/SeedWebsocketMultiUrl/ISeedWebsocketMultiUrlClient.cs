namespace SeedWebsocketMultiUrl;

public partial interface ISeedWebsocketMultiUrlClient
{
    IRealtimeApi CreateRealtimeApi(RealtimeApi.Options options);
}
