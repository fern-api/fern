using System.Text.Json;
using SeedExhaustive.Core;

#nullable enable

namespace SeedExhaustive.Endpoints;

public class UnionClient
{
    private RawClient _client;

    public UnionClient(RawClient client)
    {
        _client = client;
    }

    public async Task<object> GetAndReturnUnionAsync(object request)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                Method = HttpMethod.Post,
                Path = "/union",
                Body = request
            }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<object>(responseBody);
        }
        throw new Exception(responseBody);
    }
}
