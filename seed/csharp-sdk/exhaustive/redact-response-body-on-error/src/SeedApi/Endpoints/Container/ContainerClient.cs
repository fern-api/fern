using global::System.Text.Json;
using OneOf;
using SeedApi;
using SeedApi.Core;

namespace SeedApi.Endpoints;

public partial class ContainerClient : IContainerClient
{
    private readonly RawClient _client;

    internal ContainerClient(RawClient client)
    {
        _client = client;
    }

    private async Task<WithRawResponse<IEnumerable<string>>> GetAndReturnListOfPrimitivesAsyncCore(
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
    > GetAndReturnListOfObjectsAsyncCore(
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

    private async Task<WithRawResponse<IEnumerable<string>>> GetAndReturnSetOfPrimitivesAsyncCore(
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
    > GetAndReturnSetOfObjectsAsyncCore(
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
    > GetAndReturnMapPrimToPrimAsyncCore(
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
    > GetAndReturnMapOfPrimToObjectAsyncCore(
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
    > GetAndReturnMapOfPrimToUndiscriminatedUnionAsyncCore(
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

    private async Task<WithRawResponse<TypesObjectWithRequiredField>> GetAndReturnOptionalAsyncCore(
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
    /// await client.Endpoints.Container.GetAndReturnListOfPrimitivesAsync(new List&lt;string&gt;() { "string" });
    /// </code></example>
    public WithRawResponseTask<IEnumerable<string>> GetAndReturnListOfPrimitivesAsync(
        IEnumerable<string> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<IEnumerable<string>>(
            GetAndReturnListOfPrimitivesAsyncCore(request, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.Endpoints.Container.GetAndReturnListOfObjectsAsync(
    ///     new List&lt;TypesObjectWithRequiredField&gt;()
    ///     {
    ///         new TypesObjectWithRequiredField { String = "string" },
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<
        IEnumerable<TypesObjectWithRequiredField>
    > GetAndReturnListOfObjectsAsync(
        IEnumerable<TypesObjectWithRequiredField> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<IEnumerable<TypesObjectWithRequiredField>>(
            GetAndReturnListOfObjectsAsyncCore(request, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.Endpoints.Container.GetAndReturnSetOfPrimitivesAsync(new List&lt;string&gt;() { "string" });
    /// </code></example>
    public WithRawResponseTask<IEnumerable<string>> GetAndReturnSetOfPrimitivesAsync(
        IEnumerable<string> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<IEnumerable<string>>(
            GetAndReturnSetOfPrimitivesAsyncCore(request, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.Endpoints.Container.GetAndReturnSetOfObjectsAsync(
    ///     new List&lt;TypesObjectWithRequiredField&gt;()
    ///     {
    ///         new TypesObjectWithRequiredField { String = "string" },
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<
        IEnumerable<TypesObjectWithRequiredField>
    > GetAndReturnSetOfObjectsAsync(
        IEnumerable<TypesObjectWithRequiredField> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<IEnumerable<TypesObjectWithRequiredField>>(
            GetAndReturnSetOfObjectsAsyncCore(request, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.Endpoints.Container.GetAndReturnMapPrimToPrimAsync(
    ///     new Dictionary&lt;string, string&gt;() { { "key", "value" } }
    /// );
    /// </code></example>
    public WithRawResponseTask<Dictionary<string, string>> GetAndReturnMapPrimToPrimAsync(
        Dictionary<string, string> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<Dictionary<string, string>>(
            GetAndReturnMapPrimToPrimAsyncCore(request, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.Endpoints.Container.GetAndReturnMapOfPrimToObjectAsync(
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
    > GetAndReturnMapOfPrimToObjectAsync(
        Dictionary<string, TypesObjectWithRequiredField> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<Dictionary<string, TypesObjectWithRequiredField>>(
            GetAndReturnMapOfPrimToObjectAsyncCore(request, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.Endpoints.Container.GetAndReturnMapOfPrimToUndiscriminatedUnionAsync(
    ///     new Dictionary&lt;string, OneOf&lt;double, bool, string, IEnumerable&lt;string&gt;&gt;&gt;() { { "key", 1.1 } }
    /// );
    /// </code></example>
    public WithRawResponseTask<
        Dictionary<string, OneOf<double, bool, string, IEnumerable<string>>>
    > GetAndReturnMapOfPrimToUndiscriminatedUnionAsync(
        Dictionary<string, OneOf<double, bool, string, IEnumerable<string>>> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<
            Dictionary<string, OneOf<double, bool, string, IEnumerable<string>>>
        >(
            GetAndReturnMapOfPrimToUndiscriminatedUnionAsyncCore(
                request,
                options,
                cancellationToken
            )
        );
    }

    /// <example><code>
    /// await client.Endpoints.Container.GetAndReturnOptionalAsync(
    ///     new TypesObjectWithRequiredField { String = "string" }
    /// );
    /// </code></example>
    public WithRawResponseTask<TypesObjectWithRequiredField> GetAndReturnOptionalAsync(
        TypesObjectWithRequiredField request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<TypesObjectWithRequiredField>(
            GetAndReturnOptionalAsyncCore(request, options, cancellationToken)
        );
    }
}
