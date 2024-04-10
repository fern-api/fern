using SeedUndiscriminatedUnions;

namespace SeedUndiscriminatedUnions;

public class UnionClient
{
    private RawClient _client;

    public UnionClient(RawClient client)
    {
        _client = client;
    }

    public async void GetAsync() { }
}
