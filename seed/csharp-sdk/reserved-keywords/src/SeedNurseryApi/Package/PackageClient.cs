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
        var _query = new Dictionary<string, object>() { { "for", request.For }, };
        await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                Method = HttpMethod.Post,
                Path = "",
                Query = _query
            }
        );
    }
}
