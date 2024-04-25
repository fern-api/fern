using SeedBearerTokenEnvironmentVariable;

namespace SeedBearerTokenEnvironmentVariable;

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
    public async void GetWithBearerTokenAsync() { }
}
