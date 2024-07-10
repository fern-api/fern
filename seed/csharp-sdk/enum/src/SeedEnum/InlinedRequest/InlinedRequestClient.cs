using System.Net.Http;
using SeedEnum;
using SeedEnum.Core;

#nullable enable

namespace SeedEnum;

public class InlinedRequestClient
{
    private RawClient _client;

    public InlinedRequestClient(RawClient client)
    {
        _client = client;
    }

    public async Task SendAsync(SendEnumInlinedRequest request)
    {
        await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                Method = HttpMethod.Post,
                Path = "inlined",
                Body = request
            }
        );
    }
}
