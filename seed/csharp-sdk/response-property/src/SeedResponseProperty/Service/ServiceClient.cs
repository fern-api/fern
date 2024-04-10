using SeedResponseProperty;

namespace SeedResponseProperty;

public class ServiceClient
{
    private RawClient _client;

    public ServiceClient(RawClient client)
    {
        _client = client;
    }

    public async void GetMovieAsync() { }

    public async void GetMovieDocsAsync() { }

    public async void GetMovieNameAsync() { }

    public async void GetMovieMetadataAsync() { }

    public async void GetOptionalMovieAsync() { }

    public async void GetOptionalMovieDocsAsync() { }

    public async void GetOptionalMovieNameAsync() { }
}
