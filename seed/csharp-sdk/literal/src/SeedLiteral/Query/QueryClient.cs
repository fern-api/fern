using System.Text.Json;
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
                Method = HttpMethod.Post,
                Path = "query",
                Query = _query
            }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<SendResponse>(responseBody);
        }
        throw new Exception(responseBody);
    }
}
