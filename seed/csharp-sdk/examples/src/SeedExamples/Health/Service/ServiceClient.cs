using SeedExamples;

namespace SeedExamples.Health;

public class ServiceClient
{
    private RawClient _client;

    public ServiceClient(RawClient client)
    {
        _client = client;
    }

    /// <summary>
    /// This endpoint checks the health of a resource.
    /// </summary>
    public async void CheckAsync() { }

    /// <summary>
    /// This endpoint checks the health of the service.
    /// </summary>
    public async void PingAsync() { }
}
