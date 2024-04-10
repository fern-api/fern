using SeedExamples;

namespace SeedExamples;

public class ServiceClient
{
    private RawClient _client;

    public ServiceClient(RawClient client)
    {
        _client = client;
    }

    public async void GetMovieAsync() { }

    public async void CreateMovieAsync() { }

    public async void GetMetadataAsync() { }
}
