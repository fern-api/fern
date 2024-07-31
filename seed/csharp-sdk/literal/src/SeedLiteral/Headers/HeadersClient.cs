using System.Net.Http;
using System.Text.Json;
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
        RequestOptions? options = null
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
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = "headers",
                Headers = _headers,
                Options = options
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            try
            {
                return JsonUtils.Deserialize<SendResponse>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedLiteralException("Failed to deserialize response", e);
            }
        }

        throw new SeedLiteralApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            JsonUtils.Deserialize<object>(responseBody)
        );
    }
}
