using SeedErrorProperty;

namespace SeedErrorProperty;

public class PropertyBasedErrorClient
{
    private RawClient _client;

    public PropertyBasedErrorClient(RawClient client)
    {
        _client = client;
    }

    /// <summary>
    /// GET request that always throws an error
    /// </summary>
    public async void ThrowErrorAsync() { }
}
