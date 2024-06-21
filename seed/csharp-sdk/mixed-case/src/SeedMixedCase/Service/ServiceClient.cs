using System.Text.Json;
using SeedMixedCase;

#nullable enable

namespace SeedMixedCase;

public class ServiceClient
{
    private RawClient _client;

    public ServiceClient(RawClient client)
    {
        _client = client;
    }

    public async Task<object> GetResourceAsync(string resourceId)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest { Method = HttpMethod.Get, Path = $"/resource/{resourceId}" }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<object>(responseBody);
        }
        throw new Exception(responseBody);
    }

    public async Task<IEnumerable<object>> ListResourcesAsync(ListResourcesRequest request)
    {
        var _query = new Dictionary<string, object>()
        {
            { "page_limit", request.PageLimit.ToString() },
            { "beforeDate", request.BeforeDate.ToString() },
        };
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest
            {
                Method = HttpMethod.Get,
                Path = "/resource",
                Query = _query
            }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<IEnumerable<object>>(responseBody);
        }
        throw new Exception(responseBody);
    }
}
