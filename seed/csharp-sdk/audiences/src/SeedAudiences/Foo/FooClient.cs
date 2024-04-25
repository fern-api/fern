using SeedAudiences;

namespace SeedAudiences;

public class FooClient
{
    private RawClient _client;

    public FooClient(RawClient client)
    {
        _client = client;
    }

    public async void FindAsync() { }
}
