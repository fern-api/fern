using SeedUnions.Core;

#nullable enable

namespace SeedUnions;

public class TypesClient
{
    private RawClient _client;

    public TypesClient(RawClient client)
    {
        _client = client;
    }
}
