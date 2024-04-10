using SeedUnions;

namespace SeedUnions;

public class UnionClient
{
    private RawClient _client;

    public UnionClient(RawClient client)
    {
        _client = client;
    }

    public async void GetAsync() { }

    public async void UpdateAsync() { }
}
