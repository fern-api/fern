using SeedExhaustive.Core;

#nullable enable

namespace SeedExhaustive.Types.Object;

public class ObjectClient
{
    private RawClient _client;

    public ObjectClient(RawClient client)
    {
        _client = client;
    }
}
