using SeedApi;

namespace SeedApi.Folder;

public class undefinedClient
{
    private RawClient _client;

    public undefinedClient(RawClient client)
    {
        _client = client;
    }

    public async void FooAsync() { }
}
