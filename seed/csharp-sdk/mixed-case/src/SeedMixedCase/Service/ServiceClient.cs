using System.Text.Json;
using SeedMixedCase;

namespace SeedMixedCase;

public class ServiceClient
{
    private RawClient _client;

    public ServiceClient(RawClient client)
    {
        _client = client;
    }

    public async Task<Resource> GetResourceAsync(string resourceId)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest { Method = HttpMethod.Get, Path = $"/{resourceId}" }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<Resource>(responseBody);
        }
        throw new Exception();
    }

    public async Task<List<Resource>> ListResourcesAsync(ListResourcesRequest request)
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
                Path = "",
                Query = _query
            }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<List<Resource>>(responseBody);
        }
        throw new Exception();
    }
}
