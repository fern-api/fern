using SeedMixedCase;

namespace SeedMixedCase;

public class ServiceClient
{
    private RawClient _client;

    public ServiceClient(RawClient client)
    {
        _client = client;
    }

    public async void GetResourceAsync() { }

    public async void ListResourcesAsync() { }
}
