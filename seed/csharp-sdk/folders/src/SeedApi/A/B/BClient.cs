using System.Net.Http;
using SeedApi.Core;

#nullable enable

namespace SeedApi.A.B;

public class BClient
{
    private RawClient _client;

    public BClient(RawClient client)
    {
        _client = client;
    }

    public async Task FooAsync()
    {
        await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseURL = _client.Options.BaseURL,
                Method = HttpMethod.Post,
                Path = ""
            }
        );
    }
}
