using System.Text.Json;
using SeedUnions.Core;

#nullable enable

namespace SeedUnions;

public class UnionClient
{
    private RawClient _client;

    public UnionClient(RawClient client)
    {
        _client = client;
    }

    public async Task<object> GetAsync(string id)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest { Method = HttpMethod.Get, Path = $"/{id}" }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<object>(responseBody);
        }
        throw new Exception(responseBody);
    }

    public async Task<bool> UpdateAsync(object request)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                Method = HttpMethod.Patch,
                Path = "",
                Body = request
            }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<bool>(responseBody);
        }
        throw new Exception(responseBody);
    }
}
