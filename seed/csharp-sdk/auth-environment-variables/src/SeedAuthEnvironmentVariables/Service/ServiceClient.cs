using SeedAuthEnvironmentVariables;

namespace SeedAuthEnvironmentVariables;

public class ServiceClient
{
    private RawClient _client;

    public ServiceClient(RawClient client)
    {
        _client = client;
    }

    /// <summary>
    /// GET request with custom api key
    /// </summary>
    public async void GetWithApiKeyAsync() { }

    /// <summary>
    /// GET request with custom api key
    /// </summary>
    public async void GetWithHeaderAsync() { }
}
