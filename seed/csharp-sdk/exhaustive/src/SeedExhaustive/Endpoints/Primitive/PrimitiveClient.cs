using SeedExhaustive;

namespace SeedExhaustive.Endpoints;

public class PrimitiveClient
{
    private RawClient _client;

    public PrimitiveClient(RawClient client)
    {
        _client = client;
    }

    public async void GetAndReturnStringAsync() { }

    public async void GetAndReturnIntAsync() { }

    public async void GetAndReturnLongAsync() { }

    public async void GetAndReturnDoubleAsync() { }

    public async void GetAndReturnBoolAsync() { }

    public async void GetAndReturnDatetimeAsync() { }

    public async void GetAndReturnDateAsync() { }

    public async void GetAndReturnUuidAsync() { }

    public async void GetAndReturnBase64Async() { }
}
