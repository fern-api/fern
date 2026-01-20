using SeedWebsocket.Core;

namespace SeedWebsocket.Empty;

public partial class EmptyClient : IEmptyClient
{
    private RawClient _client;

    internal EmptyClient(RawClient client)
    {
        _client = client;
        Raw = new WithRawResponseClient(_client);
    }

    public EmptyClient.WithRawResponseClient Raw { get; }

    public EmptyRealtimeApi CreateEmptyRealtimeApi()
    {
        return new EmptyRealtimeApi(new EmptyRealtimeApi.Options());
    }

    public EmptyRealtimeApi CreateEmptyRealtimeApi(EmptyRealtimeApi.Options options)
    {
        return new EmptyRealtimeApi(options);
    }

    public partial class WithRawResponseClient
    {
        private readonly RawClient _client;

        internal WithRawResponseClient(RawClient client)
        {
            _client = client;
        }
    }
}
