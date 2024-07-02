using System.Text.Json;
using SeedExhaustive;
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
            new RawClient.JsonApiRequest { Method = HttpMethod.Get, Path = $"/params/path/{param}" }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<string>(responseBody);
        }
        throw new Exception(responseBody);
    }

    /// <summary>
    /// GET with query param
    /// </summary>
    public async void GetWithQueryAsync(GetWithQuery request)
    {
        var _query = new Dictionary<string, object>()
        {
            { "query", request.Query },
            { "number", request.Number.ToString() },
        };
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                Method = HttpMethod.Get,
                Path = "/params",
                Query = _query
            }
        );
    }

    /// <summary>
    /// GET with multiple of same query param
    /// </summary>
    public async void GetWithAllowMultipleQueryAsync(GetWithMultipleQuery request)
    {
        var _query = new Dictionary<string, object>()
        {
            { "query", request.Query },
            { "numer", request.Numer.ToString() },
        };
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                Method = HttpMethod.Get,
                Path = "/params",
                Query = _query
            }
        );
    }

    /// <summary>
    /// GET with path and query params
    /// </summary>
    public async void GetWithPathAndQueryAsync(string param, GetWithPathAndQuery request)
    {
        var _query = new Dictionary<string, object>() { { "query", request.Query }, };
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
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
                Method = HttpMethod.Put,
                Path = $"/params/path/{param}",
                Body = request
            }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<string>(responseBody);
        }
        throw new Exception(responseBody);
    }
}
