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

    public async Resource GetResourceAsync(string resourceId)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest { Method = HttpMethod.Get, Path = $"/{resourceId}" }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (responseBody.StatusCode >= 200 && responseBody.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<Resource>(responseBody);
        }
        throw new Exception();
    }

    public async List<List<Resource>> ListResourcesAsync(ListResourcesRequest request)
    {
        var _query = new Dictionary<string, string>()
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
        if (responseBody.StatusCode >= 200 && responseBody.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<List<List<Resource>>>(responseBody);
        }
        throw new Exception();
    }
}
