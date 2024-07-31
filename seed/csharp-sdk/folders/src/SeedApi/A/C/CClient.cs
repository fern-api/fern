using System.Net.Http;
using SeedApi.Core;

#nullable enable

namespace SeedApi.A.C;

public class CClient
{
    private RawClient _client;

    public CClient(RawClient client)
    {
        _client = client;
    }

    public async Task FooAsync(RequestOptions? options = null)
    {
        await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = "",
                Options = options
            }
        );
    }
}
