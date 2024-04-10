using SeedApi;

namespace SeedApi.Folder;

public class ServiceClient
{
    private RawClient _client;

    public ServiceClient(RawClient client)
    {
        _client = client;
    }

    public async void EndpointAsync() { }

    public async void UnknownRequestAsync() { }
}
