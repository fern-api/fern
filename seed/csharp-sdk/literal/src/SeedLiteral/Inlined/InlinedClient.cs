using System.Text.Json;
using SeedLiteral;

namespace SeedLiteral;

public class InlinedClient
{
    private RawClient _client;

    public InlinedClient(RawClient client)
    {
        _client = client;
    }

    public async Task<SendResponse> SendAsync(SendLiteralsInlinedRequest request)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest { Method = HttpMethod.Post, Path = "/inlined" }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<SendResponse>(responseBody);
        }
        throw new Exception();
    }
}
