using SeedCodeSamples;

namespace SeedCodeSamples;

public class ServiceClient
{
    private RawClient _client;

    public ServiceClient(RawClient client)
    {
        _client = client;
    }

    public async void HelloAsync() { }
}
