using System.Text.Json;
using SeedLiteral;

#nullable enable

namespace SeedLiteral;

public class PathClient
{
    private RawClient _client;

    public PathClient(RawClient client)
    {
        _client = client;
    }

    public async Task<SendResponse> SendAsync(string id)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest { Method = HttpMethod.Post, Path = $"/path/{id}" }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<SendResponse>(responseBody);
        }
        throw new Exception();
    }
}
