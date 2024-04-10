using SeedExhaustive;

namespace SeedExhaustive.Endpoints;

public class EnumClient
{
    private RawClient _client;

    public EnumClient(RawClient client)
    {
        _client = client;
    }

    public async void GetAndReturnEnumAsync() { }
}
