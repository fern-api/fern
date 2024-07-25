using System.Net.Http;
using SeedExhaustive;
using SeedExhaustive.Core;

#nullable enable

namespace SeedExhaustive;

public class ReqWithHeadersClient
{
    private RawClient _client;

    public ReqWithHeadersClient(RawClient client)
    {
        _client = client;
    }

    public async Task GetWithCustomHeaderAsync(ReqWithHeaders request)
    {
        var _headers = new Dictionary<string, string>()
        {
            { "X-TEST-ENDPOINT-HEADER", request.XTestEndpointHeader },
        };
        await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = "/test-headers/custom-header",
                Body = request.Body,
                Headers = _headers
            }
        );
    }
}
