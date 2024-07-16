using System.Net.Http;
using System.Text.Json;
using SeedLiteral;
using SeedLiteral.Core;

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
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonSerializer.Deserialize<SendResponse>(responseBody)!;
        }
        throw new Exception(responseBody);
    }
}
