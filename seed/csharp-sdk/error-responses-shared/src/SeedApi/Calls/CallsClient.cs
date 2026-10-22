using SeedApi.Core;

namespace SeedApi.Calls;

public partial class CallsClient : ICallsClient
{
    private readonly RawClient _client;

    internal CallsClient(RawClient client)
    {
        _client = client;
        Calls = new CallsClient_(_client);
    }

    public ICallsClient_ Calls { get; }
}
