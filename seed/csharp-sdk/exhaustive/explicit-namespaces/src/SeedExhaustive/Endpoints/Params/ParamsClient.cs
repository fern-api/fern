using System.Net.Http;
using System.Text.Json;
using System.Threading;
using global::System.Threading.Tasks;
using SeedExhaustive;
using SeedExhaustive.Core;

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
        var response = await _client
            .SendRequestAsync(
                new RawClient.JsonApiRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = $"/params/path/{JsonUtils.SerializeAsString(param)}",
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            try
            {
                return JsonUtils.Deserialize<string>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedExhaustiveException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedExhaustiveApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <summary>
    /// GET with path param
    /// </summary>
    /// <example>
    /// <code>
    /// await client.Endpoints.Params.GetWithInlinePathAsync("param", new GetWithInlinePath());
    /// </code>
    /// </example>
    public async Task<string> GetWithInlinePathAsync(
        string param,
        GetWithInlinePath request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new RawClient.JsonApiRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = $"/params/path/{JsonUtils.SerializeAsString(param)}",
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            try
            {
                return JsonUtils.Deserialize<string>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedExhaustiveException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedExhaustiveApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <summary>
    /// GET with query param
    /// </summary>
    /// <example>
    /// <code>
    /// await client.Endpoints.Params.GetWithQueryAsync(new GetWithQuery { Query = "query", Number = 1 });
    /// </code>
    /// </example>
    public async global::System.Threading.Tasks.Task GetWithQueryAsync(
        GetWithQuery request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _query = new Dictionary<string, object>();
        _query["query"] = request.Query;
        _query["number"] = request.Number.ToString();
        var response = await _client
            .SendRequestAsync(
                new RawClient.JsonApiRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = "/params",
                    Query = _query,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedExhaustiveApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <summary>
    /// GET with multiple of same query param
    /// </summary>
    /// <example>
    /// <code>
    /// await client.Endpoints.Params.GetWithAllowMultipleQueryAsync(
    ///     new GetWithMultipleQuery { Query = ["query"], Number = [1] }
    /// );
    /// </code>
    /// </example>
    public async global::System.Threading.Tasks.Task GetWithAllowMultipleQueryAsync(
        GetWithMultipleQuery request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _query = new Dictionary<string, object>();
        _query["query"] = request.Query;
        _query["number"] = request.Number.Select(_value => _value.ToString()).ToList();
        var response = await _client
            .SendRequestAsync(
                new RawClient.JsonApiRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = "/params",
                    Query = _query,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedExhaustiveApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
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
    public async global::System.Threading.Tasks.Task GetWithPathAndQueryAsync(
        string param,
        GetWithPathAndQuery request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _query = new Dictionary<string, object>();
        _query["query"] = request.Query;
        var response = await _client
            .SendRequestAsync(
                new RawClient.JsonApiRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = $"/params/path-query/{JsonUtils.SerializeAsString(param)}",
                    Query = _query,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedExhaustiveApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <summary>
    /// GET with path and query params
    /// </summary>
    /// <example>
    /// <code>
    /// await client.Endpoints.Params.GetWithInlinePathAndQueryAsync(
    ///     "param",
    ///     new GetWithInlinePathAndQuery { Query = "query" }
    /// );
    /// </code>
    /// </example>
    public async global::System.Threading.Tasks.Task GetWithInlinePathAndQueryAsync(
        string param,
        GetWithInlinePathAndQuery request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _query = new Dictionary<string, object>();
        _query["query"] = request.Query;
        var response = await _client
            .SendRequestAsync(
                new RawClient.JsonApiRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = $"/params/path-query/{JsonUtils.SerializeAsString(param)}",
                    Query = _query,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedExhaustiveApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
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
        var response = await _client
            .SendRequestAsync(
                new RawClient.JsonApiRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Put,
                    Path = $"/params/path/{JsonUtils.SerializeAsString(param)}",
                    Body = request,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            try
            {
                return JsonUtils.Deserialize<string>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedExhaustiveException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedExhaustiveApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <summary>
    /// PUT to update with path param
    /// </summary>
    /// <example>
    /// <code>
    /// await client.Endpoints.Params.ModifyWithInlinePathAsync(
    ///     "param",
    ///     new ModifyResourceAtInlinedPath { Body = "string" }
    /// );
    /// </code>
    /// </example>
    public async Task<string> ModifyWithInlinePathAsync(
        string param,
        ModifyResourceAtInlinedPath request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new RawClient.JsonApiRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Put,
                    Path = $"/params/path/{JsonUtils.SerializeAsString(param)}",
                    Body = request.Body,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            try
            {
                return JsonUtils.Deserialize<string>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedExhaustiveException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedExhaustiveApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }
}
