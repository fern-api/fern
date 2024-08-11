using SeedExhaustive.Core;

#nullable enable

namespace SeedExhaustive.Types;

public partial class UnionClient
{
    private RawClient _client;

    internal UnionClient(RawClient client)
    {
        _client = client;
    }
}
