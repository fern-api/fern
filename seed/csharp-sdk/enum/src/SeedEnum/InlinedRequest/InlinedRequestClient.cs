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

    public async Task SendAsync(SendEnumInlinedRequest request, RequestOptions? options)
    {
        await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = options?.BaseUrl ?? _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = "inlined",
                Body = request,
                Options = options
            }
        );
    }
}
