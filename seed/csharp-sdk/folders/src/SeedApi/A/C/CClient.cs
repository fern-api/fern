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

    public async Task FooAsync()
    {
        await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest { Method = HttpMethod.Post, Path = "" }
        );
    }
}
