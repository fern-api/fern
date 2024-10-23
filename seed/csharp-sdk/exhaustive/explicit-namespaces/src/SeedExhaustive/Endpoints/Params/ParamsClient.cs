using System.Net.Http;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using SeedExhaustive;
using SeedExhaustive.Core;

#nullable enable

namespace SeedExhaustive.Endpoints.Params;

public partial class ParamsClient
{
    private RawClient _client;

    internal ParamsClient(RawClient client)
    {
        _client = client;
    }

    /// <summary>
    /// GET with path param
    /// </summary>
    /// <example>
    /// <code>
    /// await client.Endpoints.Params.GetWithPathAsync("param");
    /// </code>
    /// </example>
    public async Task<string> GetWithPathAsync(
        string param,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Get,
                Path = $"/params/path/{param}",
                Options = options,
            },
            cancellationToken
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
            responseBody
        );
    }

    /// <summary>
    /// GET with query param
    /// </summary>
    /// <example>
    /// <code>
    /// await client.Endpoints.Params.GetWithQueryAsync(new GetWithQuery { Query = "query", Number = 1 });
    /// </code>
    /// </example>
    public async Task GetWithQueryAsync(
        GetWithQuery request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _query = new Dictionary<string, object>();
        _query["query"] = request.Query;
        _query["number"] = request.Number.ToString();
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Get,
                Path = "/params",
                Query = _query,
                Options = options,
            },
            cancellationToken
        );
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        throw new SeedExhaustiveApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }

    /// <summary>
    /// GET with multiple of same query param
    /// </summary>
    /// <example>
    /// <code>
    /// await client.Endpoints.Params.GetWithAllowMultipleQueryAsync(
    ///     new GetWithMultipleQuery { Query = ["query"], Numer = [1] }
    /// );
    /// </code>
    /// </example>
    public async Task GetWithAllowMultipleQueryAsync(
        GetWithMultipleQuery request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _query = new Dictionary<string, object>();
        _query["query"] = request.Query;
        _query["numer"] = request.Numer.Select(_value => _value.ToString()).ToList();
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Get,
                Path = "/params",
                Query = _query,
                Options = options,
            },
            cancellationToken
        );
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        throw new SeedExhaustiveApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }

    /// <summary>
    /// GET with path and query params
    /// </summary>
    /// <example>
    /// <code>
    /// await client.Endpoints.Params.GetWithPathAndQueryAsync(
    ///     "param",
    ///     new GetWithPathAndQuery { Query = "query" }
    /// );
    /// </code>
    /// </example>
    public async Task GetWithPathAndQueryAsync(
        string param,
        GetWithPathAndQuery request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _query = new Dictionary<string, object>();
        _query["query"] = request.Query;
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Get,
                Path = $"/params/path-query/{param}",
                Query = _query,
                Options = options,
            },
            cancellationToken
        );
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        throw new SeedExhaustiveApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }

    /// <summary>
    /// PUT to update with path param
    /// </summary>
    /// <example>
    /// <code>
    /// await client.Endpoints.Params.ModifyWithPathAsync("param", "string");
    /// </code>
    /// </example>
    public async Task<string> ModifyWithPathAsync(
        string param,
        string request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Put,
                Path = $"/params/path/{param}",
                Body = request,
                Options = options,
            },
            cancellationToken
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
            responseBody
        );
    }
}
