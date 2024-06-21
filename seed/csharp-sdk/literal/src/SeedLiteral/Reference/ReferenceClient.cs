using System.Text.Json;
using SeedLiteral;

#nullable enable

namespace SeedLiteral;

public class ReferenceClient
{
    private RawClient _client;

    public ReferenceClient(RawClient client)
    {
        _client = client;
    }

    public async Task<SendResponse> SendAsync(SendRequest request)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                Method = HttpMethod.Post,
                Path = "reference",
                Body = request
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
