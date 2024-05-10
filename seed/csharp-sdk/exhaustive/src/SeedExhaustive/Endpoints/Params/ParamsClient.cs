using System.Text.Json;
using SeedExhaustive;
using SeedExhaustive.Endpoints;

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
    public async string GetWithPathAsync(string param)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest { Method = HttpMethod.Get, Path = $"/path/{param}" }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (responseBody.StatusCode >= 200 && responseBody.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<string>(responseBody);
        }
        throw new Exception();
    }

    /// <summary>
    /// GET with query param
    /// </summary>
    public async void GetWithQueryAsync(GetWithQuery request)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest { Method = HttpMethod.Get, Path = "" }
        );
    }

    /// <summary>
    /// GET with multiple of same query param
    /// </summary>
    public async void GetWithAllowMultipleQueryAsync(GetWithMultipleQuery request)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest { Method = HttpMethod.Get, Path = "" }
        );
    }

    /// <summary>
    /// GET with path and query params
    /// </summary>
    public async void GetWithPathAndQueryAsync(string param, GetWithPathAndQuery request)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest { Method = HttpMethod.Get, Path = $"/path-query/{param}" }
        );
    }

    /// <summary>
    /// PUT to update with path param
    /// </summary>
    public async string ModifyWithPathAsync(string param, string request)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest
            {
                Method = HttpMethod.Put,
                Path = $"/path/{param}",
                Body = request
            }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (responseBody.StatusCode >= 200 && responseBody.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<string>(responseBody);
        }
        throw new Exception();
    }
}
