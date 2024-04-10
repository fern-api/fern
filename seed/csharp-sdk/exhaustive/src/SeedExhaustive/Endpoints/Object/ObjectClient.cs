using SeedExhaustive;

namespace SeedExhaustive.Endpoints;

public class ObjectClient
{
    private RawClient _client;

    public ObjectClient(RawClient client)
    {
        _client = client;
    }

    public async void GetAndReturnWithOptionalFieldAsync() { }

    public async void GetAndReturnWithRequiredFieldAsync() { }

    public async void GetAndReturnWithMapOfMapAsync() { }

    public async void GetAndReturnNestedWithOptionalFieldAsync() { }

    public async void GetAndReturnNestedWithRequiredFieldAsync() { }

    public async void GetAndReturnNestedWithRequiredFieldAsListAsync() { }
}
