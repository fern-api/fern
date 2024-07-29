using SeedExhaustive.Core;

#nullable enable

namespace SeedExhaustive.Types.Union;

public class UnionClient
{
    private RawClient _client;

    public UnionClient(RawClient client)
    {
        _client = client;
    }
}
