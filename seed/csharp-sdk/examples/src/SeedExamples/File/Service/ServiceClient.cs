using SeedExamples;

namespace SeedExamples.File;

public class ServiceClient
{
    private RawClient _client;

    public ServiceClient(RawClient client)
    {
        _client = client;
    }

    /// <summary>
    /// This endpoint returns a file by its name.
    /// </summary>
    public async void GetFileAsync() { }
}
