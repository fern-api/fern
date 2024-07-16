using SeedApi.Core;

#nullable enable

namespace SeedApi.A.D;

public class TypesClient
{
    private RawClient _client;

    public TypesClient(RawClient client)
    {
        _client = client;
    }
}
