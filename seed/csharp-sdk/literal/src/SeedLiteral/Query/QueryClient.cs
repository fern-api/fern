using System.Net.Http;
using SeedLiteral;
using SeedLiteral.Core;

#nullable enable

namespace SeedLiteral;

public class QueryClient
{
    private RawClient _client;

    public QueryClient(RawClient client)
    {
        _client = client;
    }

    public async Task<SendResponse> SendAsync(SendLiteralsInQueryRequest request)
    {
        var _query = new Dictionary<string, object>()
        {
            { "prompt", request.Prompt.ToString() },
            { "query", request.Query },
            { "stream", request.Stream.ToString() },
        };
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = "query",
                Query = _query
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
