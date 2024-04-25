using SeedFileUpload;

namespace SeedFileUpload;

public class ServiceClient
{
    private RawClient _client;

    public ServiceClient(RawClient client)
    {
        _client = client;
    }

    public async void PostAsync() { }

    public async void JustFileAsync() { }

    public async void JustFileWithQueryParamsAsync() { }
}
