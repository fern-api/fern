using global::System.Text.Json;
using OneOf;
using SeedApi.Core;

namespace SeedApi;

public partial class EndpointsContainerClient : IEndpointsContainerClient
{
    private readonly RawClient _client;

    internal EndpointsContainerClient(RawClient client)
    {
        _client = client;
    }

    private async Task<
        WithRawResponse<IEnumerable<string>>
    > EndpointsContainerGetAndReturnListOfPrimitivesAsyncCore(
        IEnumerable<string> request,
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
                    Path = "container/list-of-primitives",
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
                var responseData = JsonUtils.Deserialize<IEnumerable<string>>(responseBody)!;
                return new WithRawResponse<IEnumerable<string>>()
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
                    null,
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

    private async Task<
        WithRawResponse<IEnumerable<TypesObjectWithRequiredField>>
    > EndpointsContainerGetAndReturnListOfObjectsAsyncCore(
        IEnumerable<TypesObjectWithRequiredField> request,
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
                    Path = "container/list-of-objects",
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
                var responseData = JsonUtils.Deserialize<IEnumerable<TypesObjectWithRequiredField>>(
                    responseBody
                )!;
                return new WithRawResponse<IEnumerable<TypesObjectWithRequiredField>>()
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
                    null,
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

    private async Task<
        WithRawResponse<IEnumerable<string>>
    > EndpointsContainerGetAndReturnSetOfPrimitivesAsyncCore(
        IEnumerable<string> request,
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
                    Path = "container/set-of-primitives",
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
                var responseData = JsonUtils.Deserialize<IEnumerable<string>>(responseBody)!;
                return new WithRawResponse<IEnumerable<string>>()
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
                    null,
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

    private async Task<
        WithRawResponse<IEnumerable<TypesObjectWithRequiredField>>
    > EndpointsContainerGetAndReturnSetOfObjectsAsyncCore(
        IEnumerable<TypesObjectWithRequiredField> request,
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
                    Path = "container/set-of-objects",
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
                var responseData = JsonUtils.Deserialize<IEnumerable<TypesObjectWithRequiredField>>(
                    responseBody
                )!;
                return new WithRawResponse<IEnumerable<TypesObjectWithRequiredField>>()
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
                    null,
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

    private async Task<
        WithRawResponse<Dictionary<string, string>>
    > EndpointsContainerGetAndReturnMapPrimToPrimAsyncCore(
        Dictionary<string, string> request,
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
                    Path = "container/map-prim-to-prim",
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
                var responseData = JsonUtils.Deserialize<Dictionary<string, string>>(responseBody)!;
                return new WithRawResponse<Dictionary<string, string>>()
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
                    null,
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

    private async Task<
        WithRawResponse<Dictionary<string, TypesObjectWithRequiredField>>
    > EndpointsContainerGetAndReturnMapOfPrimToObjectAsyncCore(
        Dictionary<string, TypesObjectWithRequiredField> request,
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
                    Path = "container/map-prim-to-object",
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
                var responseData = JsonUtils.Deserialize<
                    Dictionary<string, TypesObjectWithRequiredField>
                >(responseBody)!;
                return new WithRawResponse<Dictionary<string, TypesObjectWithRequiredField>>()
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
                    null,
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

    private async Task<
        WithRawResponse<Dictionary<string, OneOf<double, bool, string, IEnumerable<string>>>>
    > EndpointsContainerGetAndReturnMapOfPrimToUndiscriminatedUnionAsyncCore(
        Dictionary<string, OneOf<double, bool, string, IEnumerable<string>>> request,
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
                    Path = "container/map-prim-to-union",
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
                var responseData = JsonUtils.Deserialize<
                    Dictionary<string, OneOf<double, bool, string, IEnumerable<string>>>
                >(responseBody)!;
                return new WithRawResponse<
                    Dictionary<string, OneOf<double, bool, string, IEnumerable<string>>>
                >()
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
                    null,
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

    private async Task<
        WithRawResponse<TypesObjectWithRequiredField>
    > EndpointsContainerGetAndReturnOptionalAsyncCore(
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
                    Path = "container/opt-objects",
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
                var responseData = JsonUtils.Deserialize<TypesObjectWithRequiredField>(
                    responseBody
                )!;
                return new WithRawResponse<TypesObjectWithRequiredField>()
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
                    null,
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
    /// await client.EndpointsContainer.EndpointsContainerGetAndReturnListOfPrimitivesAsync(
    ///     new List&lt;string&gt;() { "string" }
    /// );
    /// </code></example>
    public WithRawResponseTask<
        IEnumerable<string>
    > EndpointsContainerGetAndReturnListOfPrimitivesAsync(
        IEnumerable<string> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<IEnumerable<string>>(
            EndpointsContainerGetAndReturnListOfPrimitivesAsyncCore(
                request,
                options,
                cancellationToken
            )
        );
    }

    /// <example><code>
    /// await client.EndpointsContainer.EndpointsContainerGetAndReturnListOfObjectsAsync(
    ///     new List&lt;TypesObjectWithRequiredField&gt;()
    ///     {
    ///         new TypesObjectWithRequiredField { String = "string" },
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<
        IEnumerable<TypesObjectWithRequiredField>
    > EndpointsContainerGetAndReturnListOfObjectsAsync(
        IEnumerable<TypesObjectWithRequiredField> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<IEnumerable<TypesObjectWithRequiredField>>(
            EndpointsContainerGetAndReturnListOfObjectsAsyncCore(
                request,
                options,
                cancellationToken
            )
        );
    }

    /// <example><code>
    /// await client.EndpointsContainer.EndpointsContainerGetAndReturnSetOfPrimitivesAsync(
    ///     new List&lt;string&gt;() { "string" }
    /// );
    /// </code></example>
    public WithRawResponseTask<
        IEnumerable<string>
    > EndpointsContainerGetAndReturnSetOfPrimitivesAsync(
        IEnumerable<string> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<IEnumerable<string>>(
            EndpointsContainerGetAndReturnSetOfPrimitivesAsyncCore(
                request,
                options,
                cancellationToken
            )
        );
    }

    /// <example><code>
    /// await client.EndpointsContainer.EndpointsContainerGetAndReturnSetOfObjectsAsync(
    ///     new List&lt;TypesObjectWithRequiredField&gt;()
    ///     {
    ///         new TypesObjectWithRequiredField { String = "string" },
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<
        IEnumerable<TypesObjectWithRequiredField>
    > EndpointsContainerGetAndReturnSetOfObjectsAsync(
        IEnumerable<TypesObjectWithRequiredField> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<IEnumerable<TypesObjectWithRequiredField>>(
            EndpointsContainerGetAndReturnSetOfObjectsAsyncCore(request, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.EndpointsContainer.EndpointsContainerGetAndReturnMapPrimToPrimAsync(
    ///     new Dictionary&lt;string, string&gt;() { { "key", "value" } }
    /// );
    /// </code></example>
    public WithRawResponseTask<
        Dictionary<string, string>
    > EndpointsContainerGetAndReturnMapPrimToPrimAsync(
        Dictionary<string, string> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<Dictionary<string, string>>(
            EndpointsContainerGetAndReturnMapPrimToPrimAsyncCore(
                request,
                options,
                cancellationToken
            )
        );
    }

    /// <example><code>
    /// await client.EndpointsContainer.EndpointsContainerGetAndReturnMapOfPrimToObjectAsync(
    ///     new Dictionary&lt;string, TypesObjectWithRequiredField&gt;()
    ///     {
    ///         {
    ///             "key",
    ///             new TypesObjectWithRequiredField { String = "string" }
    ///         },
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<
        Dictionary<string, TypesObjectWithRequiredField>
    > EndpointsContainerGetAndReturnMapOfPrimToObjectAsync(
        Dictionary<string, TypesObjectWithRequiredField> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<Dictionary<string, TypesObjectWithRequiredField>>(
            EndpointsContainerGetAndReturnMapOfPrimToObjectAsyncCore(
                request,
                options,
                cancellationToken
            )
        );
    }

    /// <example><code>
    /// await client.EndpointsContainer.EndpointsContainerGetAndReturnMapOfPrimToUndiscriminatedUnionAsync(
    ///     new Dictionary&lt;string, OneOf&lt;double, bool, string, IEnumerable&lt;string&gt;&gt;&gt;() { { "key", 1.1 } }
    /// );
    /// </code></example>
    public WithRawResponseTask<
        Dictionary<string, OneOf<double, bool, string, IEnumerable<string>>>
    > EndpointsContainerGetAndReturnMapOfPrimToUndiscriminatedUnionAsync(
        Dictionary<string, OneOf<double, bool, string, IEnumerable<string>>> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<
            Dictionary<string, OneOf<double, bool, string, IEnumerable<string>>>
        >(
            EndpointsContainerGetAndReturnMapOfPrimToUndiscriminatedUnionAsyncCore(
                request,
                options,
                cancellationToken
            )
        );
    }

    /// <example><code>
    /// await client.EndpointsContainer.EndpointsContainerGetAndReturnOptionalAsync(
    ///     new TypesObjectWithRequiredField { String = "string" }
    /// );
    /// </code></example>
    public WithRawResponseTask<TypesObjectWithRequiredField> EndpointsContainerGetAndReturnOptionalAsync(
        TypesObjectWithRequiredField request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<TypesObjectWithRequiredField>(
            EndpointsContainerGetAndReturnOptionalAsyncCore(request, options, cancellationToken)
        );
    }
}
