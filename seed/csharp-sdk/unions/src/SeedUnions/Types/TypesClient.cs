using SeedUnions.Core;

#nullable enable

namespace SeedUnions;

public partial class TypesClient
{
    private RawClient _client;

    internal TypesClient(RawClient client)
    {
        _client = client;
    }
}
