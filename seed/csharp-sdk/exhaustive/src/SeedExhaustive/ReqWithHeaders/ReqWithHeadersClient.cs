using SeedExhaustive;

#nullable enable

namespace SeedExhaustive;

public class ReqWithHeadersClient
{
    private RawClient _client;

    public ReqWithHeadersClient(RawClient client)
    {
        _client = client;
    }

    public async void GetWithCustomHeaderAsync(ReqWithHeaders request)
    {
        var _headers = new Dictionary<string, string>()
        {
            { "X-TEST-ENDPOINT-HEADER", request.XTestEndpointHeader },
        };
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest
            {
                Method = HttpMethod.Post,
                Path = "/test-headers/custom-header",
                Body = request.Body,
                Headers = _headers
            }
        );
    }
}
