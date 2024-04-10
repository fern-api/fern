using SeedApi;

namespace SeedApi.A.C;

public class undefinedClient
{
    private RawClient _client;

    public undefinedClient(RawClient client)
    {
        _client = client;
    }

    public async void FooAsync() { }
}
