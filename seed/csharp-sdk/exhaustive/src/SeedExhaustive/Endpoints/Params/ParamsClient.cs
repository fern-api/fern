using System.Net.Http;
using SeedExhaustive.Core;
using SeedExhaustive.Endpoints;

#nullable enable

namespace SeedExhaustive.Endpoints;

public class ParamsClient
{
    private RawClient _client;

    public ParamsClient(RawClient client)
    {
        _client = client;
    }

    /// <summary>
    /// GET with path param
    /// </summary>
    public async Task<string> GetWithPathAsync(string param)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Get,
                Path = $"/params/path/{param}"
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonUtils.Deserialize<string>(responseBody)!;
        }
        throw new Exception(responseBody);
    }

    /// <summary>
    /// GET with query param
    /// </summary>
    public async Task GetWithQueryAsync(GetWithQuery request)
    {
        var _query = new Dictionary<string, object>()
        {
            { "query", request.Query },
            { "number", request.Number.ToString() },
        };
        await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Get,
                Path = "/params",
                Query = _query
            }
        );
    }

    /// <summary>
    /// GET with multiple of same query param
    /// </summary>
    public async Task GetWithAllowMultipleQueryAsync(GetWithMultipleQuery request)
    {
        var _query = new Dictionary<string, object>()
        {
            { "query", request.Query },
            { "numer", request.Numer.ToString() },
        };
        await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Get,
                Path = "/params",
                Query = _query
            }
        );
    }

    /// <summary>
    /// GET with path and query params
    /// </summary>
    public async Task GetWithPathAndQueryAsync(string param, GetWithPathAndQuery request)
    {
        var _query = new Dictionary<string, object>() { { "query", request.Query }, };
        await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Get,
                Path = $"/params/path-query/{param}",
                Query = _query
            }
        );
    }

    /// <summary>
    /// PUT to update with path param
    /// </summary>
    public async Task<string> ModifyWithPathAsync(string param, string request)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Put,
                Path = $"/params/path/{param}",
                Body = request
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonUtils.Deserialize<string>(responseBody)!;
        }
        throw new Exception(responseBody);
    }
}
