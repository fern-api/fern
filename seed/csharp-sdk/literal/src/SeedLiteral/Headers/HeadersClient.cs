using System.Net.Http;
using SeedLiteral;
using SeedLiteral.Core;

#nullable enable

namespace SeedLiteral;

public class HeadersClient
{
    private RawClient _client;

    public HeadersClient(RawClient client)
    {
        _client = client;
    }

    public async Task<SendResponse> SendAsync(
        SendLiteralsInHeadersRequest request,
        RequestOptions? options
    )
    {
        var _headers = new Dictionary<string, string>()
        {
            { "X-Endpoint-Version", request.EndpointVersion.ToString() },
            { "X-Async", request.Async.ToString() },
        };
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = options?.BaseUrl ?? _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = "headers",
                Headers = _headers,
                Options = options
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonUtils.Deserialize<SendResponse>(responseBody)!;
        }
        throw new Exception(responseBody);
    }
}
