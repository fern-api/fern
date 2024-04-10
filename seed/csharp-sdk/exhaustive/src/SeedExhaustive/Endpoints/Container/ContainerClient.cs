using SeedExhaustive;

namespace SeedExhaustive.Endpoints;

public class ContainerClient
{
    private RawClient _client;

    public ContainerClient(RawClient client)
    {
        _client = client;
    }

    public async void GetAndReturnListOfPrimitivesAsync() { }

    public async void GetAndReturnListOfObjectsAsync() { }

    public async void GetAndReturnSetOfPrimitivesAsync() { }

    public async void GetAndReturnSetOfObjectsAsync() { }

    public async void GetAndReturnMapPrimToPrimAsync() { }

    public async void GetAndReturnMapOfPrimToObjectAsync() { }

    public async void GetAndReturnOptionalAsync() { }
}
