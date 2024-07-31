using System.Net.Http;
using System.Text.Json;
using SeedExhaustive.Core;
using SeedExhaustive.Endpoints.Params;

#nullable enable

namespace SeedExhaustive.Endpoints.Params;

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
            try
            {
                return JsonUtils.Deserialize<string>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedExhaustiveException("Failed to deserialize response", e);
            }
        }

        throw new SeedExhaustiveApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            JsonUtils.Deserialize<object>(responseBody)
        );
    }

    /// <summary>
    /// GET with query param
    /// </summary>
    public async Task GetWithQueryAsync(GetWithQuery request)
    {
        var _query = new Dictionary<string, object>() { };
        _query["query"] = request.Query;
        _query["number"] = request.Number.ToString();
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Get,
                Path = "/params",
                Query = _query
            }
        );
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        throw new SeedExhaustiveApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            JsonUtils.Deserialize<object>(responseBody)
        );
    }

    /// <summary>
    /// GET with multiple of same query param
    /// </summary>
    public async Task GetWithAllowMultipleQueryAsync(GetWithMultipleQuery request)
    {
        var _query = new Dictionary<string, object>() { };
        _query["query"] = request.Query;
        _query["numer"] = request.Numer.Select(_value => _value.ToString()).ToList();
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Get,
                Path = "/params",
                Query = _query
            }
        );
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        throw new SeedExhaustiveApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            JsonUtils.Deserialize<object>(responseBody)
        );
    }

    /// <summary>
    /// GET with path and query params
    /// </summary>
    public async Task GetWithPathAndQueryAsync(string param, GetWithPathAndQuery request)
    {
        var _query = new Dictionary<string, object>() { };
        _query["query"] = request.Query;
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Get,
                Path = $"/params/path-query/{param}",
                Query = _query
            }
        );
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        throw new SeedExhaustiveApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            JsonUtils.Deserialize<object>(responseBody)
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
            try
            {
                return JsonUtils.Deserialize<string>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedExhaustiveException("Failed to deserialize response", e);
            }
        }

        throw new SeedExhaustiveApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            JsonUtils.Deserialize<object>(responseBody)
        );
    }
}
