using System.Net.Http;
using SeedNurseryApi;
using SeedNurseryApi.Core;

#nullable enable

namespace SeedNurseryApi;

public class PackageClient
{
    private RawClient _client;

    public PackageClient(RawClient client)
    {
        _client = client;
    }

    public async Task TestAsync(TestRequest request)
    {
        var _query = new Dictionary<string, object>() { };
        _query["for"] = request.For;
        await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = "",
                Query = _query
            }
        );
    }
}
