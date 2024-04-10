using SeedExhaustive;

namespace SeedExhaustive;

public class InlinedRequestsClient
{
    private RawClient _client;

    public InlinedRequestsClient(RawClient client)
    {
        _client = client;
    }

    /// <summary>
    /// POST with custom object in request body, response is an object
    /// </summary>
    public async void PostWithObjectBodyandResponseAsync() { }
}
