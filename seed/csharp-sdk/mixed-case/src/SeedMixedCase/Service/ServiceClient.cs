using System.Net.Http;
using SeedMixedCase;
using SeedMixedCase.Core;

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
            new RawClient.JsonApiRequest
            {
                BaseURL = _client.Options.BaseURL,
                Method = HttpMethod.Get,
                Path = $"/resource/{resourceId}"
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonUtils.Deserialize<object>(responseBody)!;
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
            new RawClient.JsonApiRequest
            {
                BaseURL = _client.Options.BaseURL,
                Method = HttpMethod.Get,
                Path = "/resource",
                Query = _query
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonUtils.Deserialize<IEnumerable<object>>(responseBody)!;
        }
        throw new Exception(responseBody);
    }
}
