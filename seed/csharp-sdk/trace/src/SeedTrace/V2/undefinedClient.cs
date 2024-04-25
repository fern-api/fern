using SeedTrace;

namespace SeedTrace.V2;

public class undefinedClient
{
    private RawClient _client;

    public undefinedClient(RawClient client)
    {
        _client = client;
    }

    public async void TestAsync() { }
}
