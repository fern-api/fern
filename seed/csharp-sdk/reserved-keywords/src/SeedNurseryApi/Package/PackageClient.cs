using SeedNurseryApi;

namespace SeedNurseryApi;

public class PackageClient
{
    private RawClient _client;

    public PackageClient(RawClient client)
    {
        _client = client;
    }

    public async void TestAsync()
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest { Method = HttpMethod.Post, Path = "" }
        );
    }
}
