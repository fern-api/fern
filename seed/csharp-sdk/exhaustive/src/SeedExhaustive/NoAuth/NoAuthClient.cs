using SeedExhaustive;

namespace SeedExhaustive;

public class NoAuthClient
{
    private RawClient _client;

    public NoAuthClient(RawClient client)
    {
        _client = client;
    }

    /// <summary>
    /// POST request with no auth
    /// </summary>
    public async void PostWithNoAuthAsync() { }
}
