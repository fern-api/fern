using System.Text.Json;
using SeedLiteral;

namespace SeedLiteral;

public class HeadersClient
{
    private RawClient _client;

    public HeadersClient(RawClient client)
    {
        _client = client;
    }

    public async SendResponse SendAsync(SendLiteralsInHeadersRequest request)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest { Method = HttpMethod.Post, Path = "/headers" }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (responseBody.StatusCode >= 200 && responseBody.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<SendResponse>(responseBody);
        }
        throw new Exception();
    }
}
