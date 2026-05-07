using global::System.Text.Json;
using SeedApi;
using SeedApi.Core;

namespace SeedApi.Endpoints.HttpMethods;

public partial class HttpMethodsClient : IHttpMethodsClient
{
    private readonly RawClient _client;

    internal HttpMethodsClient(RawClient client)
    {
        _client = client;
    }

    private async Task<WithRawResponse<string>> HttpMethodsTestGetAsyncCore(
        HttpMethodsTestGetHttpMethodsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedApi.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    Method = HttpMethod.Get,
                    Path = string.Format(
                        "http-methods/{0}",
                        ValueConvert.ToPathParameterString(request.Id)
                    ),
                    Headers = _headers,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            try
            {
                var responseData = JsonUtils.Deserialize<string>(responseBody)!;
                return new WithRawResponse<string>()
                {
                    Data = responseData,
                    RawResponse = new RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
            }
            catch (JsonException e)
            {
                throw new SeedApiApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedApiApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    private async Task<WithRawResponse<TypesObjectWithOptionalField>> HttpMethodsTestPutAsyncCore(
        HttpMethodsTestPutHttpMethodsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedApi.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    Method = HttpMethod.Put,
                    Path = string.Format(
                        "http-methods/{0}",
                        ValueConvert.ToPathParameterString(request.Id)
                    ),
                    Body = request.Body,
                    Headers = _headers,
                    ContentType = "application/json",
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            try
            {
                var responseData = JsonUtils.Deserialize<TypesObjectWithOptionalField>(
                    responseBody
                )!;
                return new WithRawResponse<TypesObjectWithOptionalField>()
                {
                    Data = responseData,
                    RawResponse = new RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
            }
            catch (JsonException e)
            {
                throw new SeedApiApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedApiApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    private async Task<WithRawResponse<bool>> HttpMethodsTestDeleteAsyncCore(
        HttpMethodsTestDeleteHttpMethodsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedApi.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    Method = HttpMethod.Delete,
                    Path = string.Format(
                        "http-methods/{0}",
                        ValueConvert.ToPathParameterString(request.Id)
                    ),
                    Headers = _headers,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            try
            {
                var responseData = JsonUtils.Deserialize<bool>(responseBody)!;
                return new WithRawResponse<bool>()
                {
                    Data = responseData,
                    RawResponse = new RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
            }
            catch (JsonException e)
            {
                throw new SeedApiApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedApiApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    private async Task<WithRawResponse<TypesObjectWithOptionalField>> HttpMethodsTestPatchAsyncCore(
        HttpMethodsTestPatchHttpMethodsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedApi.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    Method = HttpMethodExtensions.Patch,
                    Path = string.Format(
                        "http-methods/{0}",
                        ValueConvert.ToPathParameterString(request.Id)
                    ),
                    Body = request.Body,
                    Headers = _headers,
                    ContentType = "application/json",
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            try
            {
                var responseData = JsonUtils.Deserialize<TypesObjectWithOptionalField>(
                    responseBody
                )!;
                return new WithRawResponse<TypesObjectWithOptionalField>()
                {
                    Data = responseData,
                    RawResponse = new RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
            }
            catch (JsonException e)
            {
                throw new SeedApiApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedApiApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    private async Task<WithRawResponse<TypesObjectWithOptionalField>> HttpMethodsTestPostAsyncCore(
        TypesObjectWithRequiredField request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedApi.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    Method = HttpMethod.Post,
                    Path = "http-methods",
                    Body = request,
                    Headers = _headers,
                    ContentType = "application/json",
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            try
            {
                var responseData = JsonUtils.Deserialize<TypesObjectWithOptionalField>(
                    responseBody
                )!;
                return new WithRawResponse<TypesObjectWithOptionalField>()
                {
                    Data = responseData,
                    RawResponse = new RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
            }
            catch (JsonException e)
            {
                throw new SeedApiApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedApiApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.Endpoints.HttpMethods.HttpMethodsTestGetAsync(
    ///     new HttpMethodsTestGetHttpMethodsRequest { Id = "id" }
    /// );
    /// </code></example>
    public WithRawResponseTask<string> HttpMethodsTestGetAsync(
        HttpMethodsTestGetHttpMethodsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<string>(
            HttpMethodsTestGetAsyncCore(request, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.Endpoints.HttpMethods.HttpMethodsTestPutAsync(
    ///     new HttpMethodsTestPutHttpMethodsRequest
    ///     {
    ///         Id = "id",
    ///         Body = new TypesObjectWithRequiredField { String = "string" },
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<TypesObjectWithOptionalField> HttpMethodsTestPutAsync(
        HttpMethodsTestPutHttpMethodsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<TypesObjectWithOptionalField>(
            HttpMethodsTestPutAsyncCore(request, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.Endpoints.HttpMethods.HttpMethodsTestDeleteAsync(
    ///     new HttpMethodsTestDeleteHttpMethodsRequest { Id = "id" }
    /// );
    /// </code></example>
    public WithRawResponseTask<bool> HttpMethodsTestDeleteAsync(
        HttpMethodsTestDeleteHttpMethodsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<bool>(
            HttpMethodsTestDeleteAsyncCore(request, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.Endpoints.HttpMethods.HttpMethodsTestPatchAsync(
    ///     new HttpMethodsTestPatchHttpMethodsRequest
    ///     {
    ///         Id = "id",
    ///         Body = new TypesObjectWithOptionalField(),
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<TypesObjectWithOptionalField> HttpMethodsTestPatchAsync(
        HttpMethodsTestPatchHttpMethodsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<TypesObjectWithOptionalField>(
            HttpMethodsTestPatchAsyncCore(request, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.Endpoints.HttpMethods.HttpMethodsTestPostAsync(
    ///     new TypesObjectWithRequiredField { String = "string" }
    /// );
    /// </code></example>
    public WithRawResponseTask<TypesObjectWithOptionalField> HttpMethodsTestPostAsync(
        TypesObjectWithRequiredField request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<TypesObjectWithOptionalField>(
            HttpMethodsTestPostAsyncCore(request, options, cancellationToken)
        );
    }
}
