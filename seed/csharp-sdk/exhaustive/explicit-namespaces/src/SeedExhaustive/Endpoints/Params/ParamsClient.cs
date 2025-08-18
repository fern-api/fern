using System.Net.Http;
using System.Text.Json;
using System.Threading;
using global::System.Threading.Tasks;
using SeedExhaustive;
using SeedExhaustive.Core;

namespace SeedExhaustive.Endpoints.Params;

public partial class ParamsClient
{
    private SeedExhaustive.Core.RawClient _client;

    internal ParamsClient(SeedExhaustive.Core.RawClient client)
    {
        _client = client;
    }

    /// <summary>
    /// GET with path param
    /// </summary>
    /// <example><code>
    /// await client.Endpoints.Params.GetWithPathAsync("param");
    /// </code></example>
    public async Task<string> GetWithPathAsync(
        string param,
        SeedExhaustive.RequestOptions? options = null,
        System.Threading.CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new SeedExhaustive.Core.JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = System.Net.Http.HttpMethod.Get,
                    Path = string.Format(
                        "/params/path/{0}",
                        SeedExhaustive.Core.ValueConvert.ToPathParameterString(param)
                    ),
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
                return SeedExhaustive.Core.JsonUtils.Deserialize<string>(responseBody)!;
            }
            catch (System.Text.Json.JsonException e)
            {
                throw new SeedExhaustive.SeedExhaustiveException(
                    "Failed to deserialize response",
                    e
                );
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedExhaustive.SeedExhaustiveApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <summary>
    /// GET with path param
    /// </summary>
    /// <example><code>
    /// await client.Endpoints.Params.GetWithInlinePathAsync(
    ///     new SeedExhaustive.Endpoints.Params.GetWithInlinePath { Param = "param" }
    /// );
    /// </code></example>
    public async Task<string> GetWithInlinePathAsync(
        SeedExhaustive.Endpoints.Params.GetWithInlinePath request,
        SeedExhaustive.RequestOptions? options = null,
        System.Threading.CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new SeedExhaustive.Core.JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = System.Net.Http.HttpMethod.Get,
                    Path = string.Format(
                        "/params/path/{0}",
                        SeedExhaustive.Core.ValueConvert.ToPathParameterString(request.Param)
                    ),
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
                return SeedExhaustive.Core.JsonUtils.Deserialize<string>(responseBody)!;
            }
            catch (System.Text.Json.JsonException e)
            {
                throw new SeedExhaustive.SeedExhaustiveException(
                    "Failed to deserialize response",
                    e
                );
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedExhaustive.SeedExhaustiveApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <summary>
    /// GET with query param
    /// </summary>
    /// <example><code>
    /// await client.Endpoints.Params.GetWithQueryAsync(
    ///     new SeedExhaustive.Endpoints.Params.GetWithQuery { Query = "query", Number = 1 }
    /// );
    /// </code></example>
    public async global::System.Threading.Tasks.Task GetWithQueryAsync(
        SeedExhaustive.Endpoints.Params.GetWithQuery request,
        SeedExhaustive.RequestOptions? options = null,
        System.Threading.CancellationToken cancellationToken = default
    )
    {
        var _query = new Dictionary<string, object>();
        _query["query"] = request.Query;
        _query["number"] = request.Number.ToString();
        var response = await _client
            .SendRequestAsync(
                new SeedExhaustive.Core.JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = System.Net.Http.HttpMethod.Get,
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
            throw new SeedExhaustive.SeedExhaustiveApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <summary>
    /// GET with multiple of same query param
    /// </summary>
    /// <example><code>
    /// await client.Endpoints.Params.GetWithAllowMultipleQueryAsync(
    ///     new SeedExhaustive.Endpoints.Params.GetWithMultipleQuery { Query = ["query"], Number = [1] }
    /// );
    /// </code></example>
    public async global::System.Threading.Tasks.Task GetWithAllowMultipleQueryAsync(
        SeedExhaustive.Endpoints.Params.GetWithMultipleQuery request,
        SeedExhaustive.RequestOptions? options = null,
        System.Threading.CancellationToken cancellationToken = default
    )
    {
        var _query = new Dictionary<string, object>();
        _query["query"] = request.Query;
        _query["number"] = request.Number.Select(_value => _value.ToString()).ToList();
        var response = await _client
            .SendRequestAsync(
                new SeedExhaustive.Core.JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = System.Net.Http.HttpMethod.Get,
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
            throw new SeedExhaustive.SeedExhaustiveApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <summary>
    /// GET with path and query params
    /// </summary>
    /// <example><code>
    /// await client.Endpoints.Params.GetWithPathAndQueryAsync(
    ///     "param",
    ///     new SeedExhaustive.Endpoints.Params.GetWithPathAndQuery { Query = "query" }
    /// );
    /// </code></example>
    public async global::System.Threading.Tasks.Task GetWithPathAndQueryAsync(
        string param,
        SeedExhaustive.Endpoints.Params.GetWithPathAndQuery request,
        SeedExhaustive.RequestOptions? options = null,
        System.Threading.CancellationToken cancellationToken = default
    )
    {
        var _query = new Dictionary<string, object>();
        _query["query"] = request.Query;
        var response = await _client
            .SendRequestAsync(
                new SeedExhaustive.Core.JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = System.Net.Http.HttpMethod.Get,
                    Path = string.Format(
                        "/params/path-query/{0}",
                        SeedExhaustive.Core.ValueConvert.ToPathParameterString(param)
                    ),
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
            throw new SeedExhaustive.SeedExhaustiveApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <summary>
    /// GET with path and query params
    /// </summary>
    /// <example><code>
    /// await client.Endpoints.Params.GetWithInlinePathAndQueryAsync(
    ///     new SeedExhaustive.Endpoints.Params.GetWithInlinePathAndQuery
    ///     {
    ///         Param = "param",
    ///         Query = "query",
    ///     }
    /// );
    /// </code></example>
    public async global::System.Threading.Tasks.Task GetWithInlinePathAndQueryAsync(
        SeedExhaustive.Endpoints.Params.GetWithInlinePathAndQuery request,
        SeedExhaustive.RequestOptions? options = null,
        System.Threading.CancellationToken cancellationToken = default
    )
    {
        var _query = new Dictionary<string, object>();
        _query["query"] = request.Query;
        var response = await _client
            .SendRequestAsync(
                new SeedExhaustive.Core.JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = System.Net.Http.HttpMethod.Get,
                    Path = string.Format(
                        "/params/path-query/{0}",
                        SeedExhaustive.Core.ValueConvert.ToPathParameterString(request.Param)
                    ),
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
            throw new SeedExhaustive.SeedExhaustiveApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <summary>
    /// PUT to update with path param
    /// </summary>
    /// <example><code>
    /// await client.Endpoints.Params.ModifyWithPathAsync("param", "string");
    /// </code></example>
    public async Task<string> ModifyWithPathAsync(
        string param,
        string request,
        SeedExhaustive.RequestOptions? options = null,
        System.Threading.CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new SeedExhaustive.Core.JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = System.Net.Http.HttpMethod.Put,
                    Path = string.Format(
                        "/params/path/{0}",
                        SeedExhaustive.Core.ValueConvert.ToPathParameterString(param)
                    ),
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
                return SeedExhaustive.Core.JsonUtils.Deserialize<string>(responseBody)!;
            }
            catch (System.Text.Json.JsonException e)
            {
                throw new SeedExhaustive.SeedExhaustiveException(
                    "Failed to deserialize response",
                    e
                );
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedExhaustive.SeedExhaustiveApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <summary>
    /// PUT to update with path param
    /// </summary>
    /// <example><code>
    /// await client.Endpoints.Params.ModifyWithInlinePathAsync(
    ///     new SeedExhaustive.Endpoints.Params.ModifyResourceAtInlinedPath
    ///     {
    ///         Param = "param",
    ///         Body = "string",
    ///     }
    /// );
    /// </code></example>
    public async Task<string> ModifyWithInlinePathAsync(
        SeedExhaustive.Endpoints.Params.ModifyResourceAtInlinedPath request,
        SeedExhaustive.RequestOptions? options = null,
        System.Threading.CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new SeedExhaustive.Core.JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = System.Net.Http.HttpMethod.Put,
                    Path = string.Format(
                        "/params/path/{0}",
                        SeedExhaustive.Core.ValueConvert.ToPathParameterString(request.Param)
                    ),
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
                return SeedExhaustive.Core.JsonUtils.Deserialize<string>(responseBody)!;
            }
            catch (System.Text.Json.JsonException e)
            {
                throw new SeedExhaustive.SeedExhaustiveException(
                    "Failed to deserialize response",
                    e
                );
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedExhaustive.SeedExhaustiveApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }
}
