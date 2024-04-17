using SeedBasicAuthEnvironmentVariables;

namespace SeedBasicAuthEnvironmentVariables;

public class BasicAuthClient
{
    private RawClient _client;

    public BasicAuthClient(RawClient client)
    {
        _client = client;
    }

    /// <summary>
    /// GET request with basic auth scheme
    /// </summary>
    public async void GetWithBasicAuthAsync() { }

    /// <summary>
    /// POST request with basic auth scheme
    /// </summary>
    public async void PostWithBasicAuthAsync() { }
}
