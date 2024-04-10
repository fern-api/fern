using SeedExhaustive;

namespace SeedExhaustive.Endpoints;

public class HttpMethodsClient
{
    private RawClient _client;

    public HttpMethodsClient(RawClient client)
    {
        _client = client;
    }

    public async void TestGetAsync() { }

    public async void TestPostAsync() { }

    public async void TestPutAsync() { }

    public async void TestPatchAsync() { }

    public async void TestDeleteAsync() { }
}
