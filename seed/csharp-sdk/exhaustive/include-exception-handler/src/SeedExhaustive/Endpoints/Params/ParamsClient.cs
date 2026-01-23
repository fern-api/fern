using System.Text.Json;
using SeedExhaustive;
using SeedExhaustive.Core;

namespace SeedExhaustive.Endpoints;

public partial class ParamsClient : IParamsClient
{
    private RawClient _client;

    internal ParamsClient(RawClient client)
    {
        try
        {
            _client = client;
        }
        catch (Exception ex)
        {
            client.Options.ExceptionHandler?.CaptureException(ex);
            throw;
        }
    }

    private async Task<WithRawResponse<string>> GetWithPathAsyncCore(
        string param,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var response = await _client
                    .SendRequestAsync(
                        new JsonRequest
                        {
                            BaseUrl = _client.Options.BaseUrl,
                            Method = HttpMethod.Get,
                            Path = string.Format(
                                "/params/path/{0}",
                                ValueConvert.ToPathParameterString(param)
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
                        var responseData = JsonUtils.Deserialize<string>(responseBody)!;
                        return new WithRawResponse<string>()
                        {
                            Data = responseData,
                            RawResponse = new RawResponse()
                            {
                                StatusCode = response.Raw.StatusCode,
                                Url =
                                    response.Raw.RequestMessage?.RequestUri
                                    ?? new Uri("about:blank"),
                                Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                            },
                        };
                    }
                    catch (JsonException e)
                    {
                        throw new SeedExhaustiveApiException(
                            "Failed to deserialize response",
                            response.StatusCode,
                            responseBody,
                            e
                        );
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
            })
            .ConfigureAwait(false);
    }

    private async Task<WithRawResponse<string>> GetWithInlinePathAsyncCore(
        GetWithInlinePath request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var response = await _client
                    .SendRequestAsync(
                        new JsonRequest
                        {
                            BaseUrl = _client.Options.BaseUrl,
                            Method = HttpMethod.Get,
                            Path = string.Format(
                                "/params/path/{0}",
                                ValueConvert.ToPathParameterString(request.Param)
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
                        var responseData = JsonUtils.Deserialize<string>(responseBody)!;
                        return new WithRawResponse<string>()
                        {
                            Data = responseData,
                            RawResponse = new RawResponse()
                            {
                                StatusCode = response.Raw.StatusCode,
                                Url =
                                    response.Raw.RequestMessage?.RequestUri
                                    ?? new Uri("about:blank"),
                                Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                            },
                        };
                    }
                    catch (JsonException e)
                    {
                        throw new SeedExhaustiveApiException(
                            "Failed to deserialize response",
                            response.StatusCode,
                            responseBody,
                            e
                        );
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
            })
            .ConfigureAwait(false);
    }

    private async Task<WithRawResponse<string>> ModifyWithPathAsyncCore(
        string param,
        string request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var response = await _client
                    .SendRequestAsync(
                        new JsonRequest
                        {
                            BaseUrl = _client.Options.BaseUrl,
                            Method = HttpMethod.Put,
                            Path = string.Format(
                                "/params/path/{0}",
                                ValueConvert.ToPathParameterString(param)
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
                        var responseData = JsonUtils.Deserialize<string>(responseBody)!;
                        return new WithRawResponse<string>()
                        {
                            Data = responseData,
                            RawResponse = new RawResponse()
                            {
                                StatusCode = response.Raw.StatusCode,
                                Url =
                                    response.Raw.RequestMessage?.RequestUri
                                    ?? new Uri("about:blank"),
                                Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                            },
                        };
                    }
                    catch (JsonException e)
                    {
                        throw new SeedExhaustiveApiException(
                            "Failed to deserialize response",
                            response.StatusCode,
                            responseBody,
                            e
                        );
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
            })
            .ConfigureAwait(false);
    }

    private async Task<WithRawResponse<string>> ModifyWithInlinePathAsyncCore(
        ModifyResourceAtInlinedPath request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var response = await _client
                    .SendRequestAsync(
                        new JsonRequest
                        {
                            BaseUrl = _client.Options.BaseUrl,
                            Method = HttpMethod.Put,
                            Path = string.Format(
                                "/params/path/{0}",
                                ValueConvert.ToPathParameterString(request.Param)
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
                        var responseData = JsonUtils.Deserialize<string>(responseBody)!;
                        return new WithRawResponse<string>()
                        {
                            Data = responseData,
                            RawResponse = new RawResponse()
                            {
                                StatusCode = response.Raw.StatusCode,
                                Url =
                                    response.Raw.RequestMessage?.RequestUri
                                    ?? new Uri("about:blank"),
                                Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                            },
                        };
                    }
                    catch (JsonException e)
                    {
                        throw new SeedExhaustiveApiException(
                            "Failed to deserialize response",
                            response.StatusCode,
                            responseBody,
                            e
                        );
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
            })
            .ConfigureAwait(false);
    }

    /// <summary>
    /// GET with path param
    /// </summary>
    /// <example><code>
    /// await client.Endpoints.Params.GetWithPathAsync("param");
    /// </code></example>
    public WithRawResponseTask<string> GetWithPathAsync(
        string param,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<string>(
            GetWithPathAsyncCore(param, options, cancellationToken)
        );
    }

    /// <summary>
    /// GET with path param
    /// </summary>
    /// <example><code>
    /// await client.Endpoints.Params.GetWithInlinePathAsync(new GetWithInlinePath { Param = "param" });
    /// </code></example>
    public WithRawResponseTask<string> GetWithInlinePathAsync(
        GetWithInlinePath request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<string>(
            GetWithInlinePathAsyncCore(request, options, cancellationToken)
        );
    }

    /// <summary>
    /// GET with query param
    /// </summary>
    /// <example><code>
    /// await client.Endpoints.Params.GetWithQueryAsync(new GetWithQuery { Query = "query", Number = 1 });
    /// </code></example>
    public async Task GetWithQueryAsync(
        GetWithQuery request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var _queryString = new SeedExhaustive.Core.QueryStringBuilder.Builder(capacity: 2)
                    .Add("query", request.Query)
                    .Add("number", request.Number)
                    .Build();
                var response = await _client
                    .SendRequestAsync(
                        new JsonRequest
                        {
                            BaseUrl = _client.Options.BaseUrl,
                            Method = HttpMethod.Get,
                            Path = "/params",
                            QueryString = _queryString,
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
            })
            .ConfigureAwait(false);
    }

    /// <summary>
    /// GET with multiple of same query param
    /// </summary>
    /// <example><code>
    /// await client.Endpoints.Params.GetWithAllowMultipleQueryAsync(
    ///     new GetWithMultipleQuery { Query = ["query"], Number = [1] }
    /// );
    /// </code></example>
    public async Task GetWithAllowMultipleQueryAsync(
        GetWithMultipleQuery request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var _queryString = new SeedExhaustive.Core.QueryStringBuilder.Builder(capacity: 2)
                    .Add("query", request.Query)
                    .Add("number", request.Number)
                    .Build();
                var response = await _client
                    .SendRequestAsync(
                        new JsonRequest
                        {
                            BaseUrl = _client.Options.BaseUrl,
                            Method = HttpMethod.Get,
                            Path = "/params",
                            QueryString = _queryString,
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
            })
            .ConfigureAwait(false);
    }

    /// <summary>
    /// GET with path and query params
    /// </summary>
    /// <example><code>
    /// await client.Endpoints.Params.GetWithPathAndQueryAsync(
    ///     "param",
    ///     new GetWithPathAndQuery { Query = "query" }
    /// );
    /// </code></example>
    public async Task GetWithPathAndQueryAsync(
        string param,
        GetWithPathAndQuery request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var _queryString = new SeedExhaustive.Core.QueryStringBuilder.Builder(capacity: 1)
                    .Add("query", request.Query)
                    .Build();
                var response = await _client
                    .SendRequestAsync(
                        new JsonRequest
                        {
                            BaseUrl = _client.Options.BaseUrl,
                            Method = HttpMethod.Get,
                            Path = string.Format(
                                "/params/path-query/{0}",
                                ValueConvert.ToPathParameterString(param)
                            ),
                            QueryString = _queryString,
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
            })
            .ConfigureAwait(false);
    }

    /// <summary>
    /// GET with path and query params
    /// </summary>
    /// <example><code>
    /// await client.Endpoints.Params.GetWithInlinePathAndQueryAsync(
    ///     new GetWithInlinePathAndQuery { Param = "param", Query = "query" }
    /// );
    /// </code></example>
    public async Task GetWithInlinePathAndQueryAsync(
        GetWithInlinePathAndQuery request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var _queryString = new SeedExhaustive.Core.QueryStringBuilder.Builder(capacity: 1)
                    .Add("query", request.Query)
                    .Build();
                var response = await _client
                    .SendRequestAsync(
                        new JsonRequest
                        {
                            BaseUrl = _client.Options.BaseUrl,
                            Method = HttpMethod.Get,
                            Path = string.Format(
                                "/params/path-query/{0}",
                                ValueConvert.ToPathParameterString(request.Param)
                            ),
                            QueryString = _queryString,
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
            })
            .ConfigureAwait(false);
    }

    /// <summary>
    /// PUT to update with path param
    /// </summary>
    /// <example><code>
    /// await client.Endpoints.Params.ModifyWithPathAsync("param", "string");
    /// </code></example>
    public WithRawResponseTask<string> ModifyWithPathAsync(
        string param,
        string request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<string>(
            ModifyWithPathAsyncCore(param, request, options, cancellationToken)
        );
    }

    /// <summary>
    /// PUT to update with path param
    /// </summary>
    /// <example><code>
    /// await client.Endpoints.Params.ModifyWithInlinePathAsync(
    ///     new ModifyResourceAtInlinedPath { Param = "param", Body = "string" }
    /// );
    /// </code></example>
    public WithRawResponseTask<string> ModifyWithInlinePathAsync(
        ModifyResourceAtInlinedPath request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<string>(
            ModifyWithInlinePathAsyncCore(request, options, cancellationToken)
        );
    }
}
