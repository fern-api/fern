using SeedCustomAuth;

namespace SeedCustomAuth;

public class CustomAuthClient
{
    private RawClient _client;

    public CustomAuthClient(RawClient client)
    {
        _client = client;
    }

    /// <summary>
    /// GET request with custom auth scheme
    /// </summary>
    public async void GetWithCustomAuthAsync() { }

    /// <summary>
    /// POST request with custom auth scheme
    /// </summary>
    public async void PostWithCustomAuthAsync() { }
}
