using SeedBytes;

namespace SeedBytes;

public class ServiceClient
{
    private RawClient _client;

    public ServiceClient(RawClient client)
    {
        _client = client;
    }

    public async void UploadAsync() { }
}
