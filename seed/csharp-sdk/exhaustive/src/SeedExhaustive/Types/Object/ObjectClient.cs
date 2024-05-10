using SeedExhaustive;

namespace SeedExhaustive.Types;

public class ObjectClient
{
    private RawClient _client;

    public ObjectClient(RawClient client)
    {
        _client = client;
    }
}
