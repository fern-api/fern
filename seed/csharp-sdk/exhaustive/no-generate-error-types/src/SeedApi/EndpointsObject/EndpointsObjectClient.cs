using global::System.Text.Json;
using SeedApi.Core;

namespace SeedApi;

public partial class EndpointsObjectClient : IEndpointsObjectClient
{
    private readonly RawClient _client;

    internal EndpointsObjectClient(RawClient client)
    {
        _client = client;
    }

    private async Task<
        WithRawResponse<TypesObjectWithOptionalField>
    > EndpointsObjectGetAndReturnWithOptionalFieldAsyncCore(
        TypesObjectWithOptionalField request,
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
                    Path = "object/get-and-return-with-optional-field",
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

    private async Task<
        WithRawResponse<TypesObjectWithRequiredField>
    > EndpointsObjectGetAndReturnWithRequiredFieldAsyncCore(
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
                    Path = "object/get-and-return-with-required-field",
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

    private async Task<
        WithRawResponse<TypesObjectWithMapOfMap>
    > EndpointsObjectGetAndReturnWithMapOfMapAsyncCore(
        TypesObjectWithMapOfMap request,
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
                    Path = "object/get-and-return-with-map-of-map",
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
                var responseData = JsonUtils.Deserialize<TypesObjectWithMapOfMap>(responseBody)!;
                return new WithRawResponse<TypesObjectWithMapOfMap>()
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

    private async Task<
        WithRawResponse<TypesNestedObjectWithOptionalField>
    > EndpointsObjectGetAndReturnNestedWithOptionalFieldAsyncCore(
        TypesNestedObjectWithOptionalField request,
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
                    Path = "object/get-and-return-nested-with-optional-field",
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
                var responseData = JsonUtils.Deserialize<TypesNestedObjectWithOptionalField>(
                    responseBody
                )!;
                return new WithRawResponse<TypesNestedObjectWithOptionalField>()
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

    private async Task<
        WithRawResponse<TypesNestedObjectWithRequiredField>
    > EndpointsObjectGetAndReturnNestedWithRequiredFieldAsyncCore(
        EndpointsObjectGetAndReturnNestedWithRequiredFieldRequest request,
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
                    Path = string.Format(
                        "object/get-and-return-nested-with-required-field/{0}",
                        ValueConvert.ToPathParameterString(request.String)
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
                var responseData = JsonUtils.Deserialize<TypesNestedObjectWithRequiredField>(
                    responseBody
                )!;
                return new WithRawResponse<TypesNestedObjectWithRequiredField>()
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

    private async Task<
        WithRawResponse<TypesNestedObjectWithRequiredField>
    > EndpointsObjectGetAndReturnNestedWithRequiredFieldAsListAsyncCore(
        IEnumerable<TypesNestedObjectWithRequiredField> request,
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
                    Path = "object/get-and-return-nested-with-required-field-list",
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
                var responseData = JsonUtils.Deserialize<TypesNestedObjectWithRequiredField>(
                    responseBody
                )!;
                return new WithRawResponse<TypesNestedObjectWithRequiredField>()
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

    private async Task<
        WithRawResponse<TypesObjectWithUnknownField>
    > EndpointsObjectGetAndReturnWithUnknownFieldAsyncCore(
        TypesObjectWithUnknownField request,
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
                    Path = "object/get-and-return-with-unknown-field",
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
                var responseData = JsonUtils.Deserialize<TypesObjectWithUnknownField>(
                    responseBody
                )!;
                return new WithRawResponse<TypesObjectWithUnknownField>()
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

    private async Task<
        WithRawResponse<TypesObjectWithDocumentedUnknownType>
    > EndpointsObjectGetAndReturnWithDocumentedUnknownTypeAsyncCore(
        TypesObjectWithDocumentedUnknownType request,
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
                    Path = "object/get-and-return-with-documented-unknown-type",
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
                var responseData = JsonUtils.Deserialize<TypesObjectWithDocumentedUnknownType>(
                    responseBody
                )!;
                return new WithRawResponse<TypesObjectWithDocumentedUnknownType>()
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

    private async Task<
        WithRawResponse<Dictionary<string, object?>>
    > EndpointsObjectGetAndReturnMapOfDocumentedUnknownTypeAsyncCore(
        Dictionary<string, object?> request,
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
                    Path = "object/get-and-return-map-of-documented-unknown-type",
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
                var responseData = JsonUtils.Deserialize<Dictionary<string, object?>>(
                    responseBody
                )!;
                return new WithRawResponse<Dictionary<string, object?>>()
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

    private async Task<
        WithRawResponse<TypesObjectWithMixedRequiredAndOptionalFields>
    > EndpointsObjectGetAndReturnWithMixedRequiredAndOptionalFieldsAsyncCore(
        TypesObjectWithMixedRequiredAndOptionalFields request,
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
                    Path = "object/get-and-return-with-mixed-required-and-optional-fields",
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
                var responseData =
                    JsonUtils.Deserialize<TypesObjectWithMixedRequiredAndOptionalFields>(
                        responseBody
                    )!;
                return new WithRawResponse<TypesObjectWithMixedRequiredAndOptionalFields>()
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

    private async Task<
        WithRawResponse<TypesObjectWithRequiredNestedObject>
    > EndpointsObjectGetAndReturnWithRequiredNestedObjectAsyncCore(
        TypesObjectWithRequiredNestedObject request,
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
                    Path = "object/get-and-return-with-required-nested-object",
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
                var responseData = JsonUtils.Deserialize<TypesObjectWithRequiredNestedObject>(
                    responseBody
                )!;
                return new WithRawResponse<TypesObjectWithRequiredNestedObject>()
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

    private async Task<
        WithRawResponse<TypesObjectWithDatetimeLikeString>
    > EndpointsObjectGetAndReturnWithDatetimeLikeStringAsyncCore(
        TypesObjectWithDatetimeLikeString request,
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
                    Path = "object/get-and-return-with-datetime-like-string",
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
                var responseData = JsonUtils.Deserialize<TypesObjectWithDatetimeLikeString>(
                    responseBody
                )!;
                return new WithRawResponse<TypesObjectWithDatetimeLikeString>()
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
    /// await client.EndpointsObject.EndpointsObjectGetAndReturnWithOptionalFieldAsync(
    ///     new TypesObjectWithOptionalField()
    /// );
    /// </code></example>
    public WithRawResponseTask<TypesObjectWithOptionalField> EndpointsObjectGetAndReturnWithOptionalFieldAsync(
        TypesObjectWithOptionalField request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<TypesObjectWithOptionalField>(
            EndpointsObjectGetAndReturnWithOptionalFieldAsyncCore(
                request,
                options,
                cancellationToken
            )
        );
    }

    /// <example><code>
    /// await client.EndpointsObject.EndpointsObjectGetAndReturnWithRequiredFieldAsync(
    ///     new TypesObjectWithRequiredField { String = "string" }
    /// );
    /// </code></example>
    public WithRawResponseTask<TypesObjectWithRequiredField> EndpointsObjectGetAndReturnWithRequiredFieldAsync(
        TypesObjectWithRequiredField request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<TypesObjectWithRequiredField>(
            EndpointsObjectGetAndReturnWithRequiredFieldAsyncCore(
                request,
                options,
                cancellationToken
            )
        );
    }

    /// <example><code>
    /// await client.EndpointsObject.EndpointsObjectGetAndReturnWithMapOfMapAsync(
    ///     new TypesObjectWithMapOfMap
    ///     {
    ///         Map = new Dictionary&lt;string, Dictionary&lt;string, string&gt;&gt;()
    ///         {
    ///             {
    ///                 "key",
    ///                 new Dictionary&lt;string, string&gt;() { { "key", "value" } }
    ///             },
    ///         },
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<TypesObjectWithMapOfMap> EndpointsObjectGetAndReturnWithMapOfMapAsync(
        TypesObjectWithMapOfMap request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<TypesObjectWithMapOfMap>(
            EndpointsObjectGetAndReturnWithMapOfMapAsyncCore(request, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.EndpointsObject.EndpointsObjectGetAndReturnNestedWithOptionalFieldAsync(
    ///     new TypesNestedObjectWithOptionalField()
    /// );
    /// </code></example>
    public WithRawResponseTask<TypesNestedObjectWithOptionalField> EndpointsObjectGetAndReturnNestedWithOptionalFieldAsync(
        TypesNestedObjectWithOptionalField request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<TypesNestedObjectWithOptionalField>(
            EndpointsObjectGetAndReturnNestedWithOptionalFieldAsyncCore(
                request,
                options,
                cancellationToken
            )
        );
    }

    /// <example><code>
    /// await client.EndpointsObject.EndpointsObjectGetAndReturnNestedWithRequiredFieldAsync(
    ///     new EndpointsObjectGetAndReturnNestedWithRequiredFieldRequest
    ///     {
    ///         String = "string",
    ///         Body = new TypesNestedObjectWithRequiredField
    ///         {
    ///             String = "string",
    ///             NestedObject = new TypesObjectWithOptionalField(),
    ///         },
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<TypesNestedObjectWithRequiredField> EndpointsObjectGetAndReturnNestedWithRequiredFieldAsync(
        EndpointsObjectGetAndReturnNestedWithRequiredFieldRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<TypesNestedObjectWithRequiredField>(
            EndpointsObjectGetAndReturnNestedWithRequiredFieldAsyncCore(
                request,
                options,
                cancellationToken
            )
        );
    }

    /// <example><code>
    /// await client.EndpointsObject.EndpointsObjectGetAndReturnNestedWithRequiredFieldAsListAsync(
    ///     new List&lt;TypesNestedObjectWithRequiredField&gt;()
    ///     {
    ///         new TypesNestedObjectWithRequiredField
    ///         {
    ///             String = "string",
    ///             NestedObject = new TypesObjectWithOptionalField(),
    ///         },
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<TypesNestedObjectWithRequiredField> EndpointsObjectGetAndReturnNestedWithRequiredFieldAsListAsync(
        IEnumerable<TypesNestedObjectWithRequiredField> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<TypesNestedObjectWithRequiredField>(
            EndpointsObjectGetAndReturnNestedWithRequiredFieldAsListAsyncCore(
                request,
                options,
                cancellationToken
            )
        );
    }

    /// <example><code>
    /// await client.EndpointsObject.EndpointsObjectGetAndReturnWithUnknownFieldAsync(
    ///     new TypesObjectWithUnknownField
    ///     {
    ///         Unknown = new Dictionary&lt;object, object?&gt;() { { "key", "value" } },
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<TypesObjectWithUnknownField> EndpointsObjectGetAndReturnWithUnknownFieldAsync(
        TypesObjectWithUnknownField request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<TypesObjectWithUnknownField>(
            EndpointsObjectGetAndReturnWithUnknownFieldAsyncCore(
                request,
                options,
                cancellationToken
            )
        );
    }

    /// <example><code>
    /// await client.EndpointsObject.EndpointsObjectGetAndReturnWithDocumentedUnknownTypeAsync(
    ///     new TypesObjectWithDocumentedUnknownType
    ///     {
    ///         DocumentedUnknownType = new Dictionary&lt;object, object?&gt;() { { "key", "value" } },
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<TypesObjectWithDocumentedUnknownType> EndpointsObjectGetAndReturnWithDocumentedUnknownTypeAsync(
        TypesObjectWithDocumentedUnknownType request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<TypesObjectWithDocumentedUnknownType>(
            EndpointsObjectGetAndReturnWithDocumentedUnknownTypeAsyncCore(
                request,
                options,
                cancellationToken
            )
        );
    }

    /// <example><code>
    /// await client.EndpointsObject.EndpointsObjectGetAndReturnMapOfDocumentedUnknownTypeAsync(
    ///     new Dictionary&lt;string, object&gt;() { }
    /// );
    /// </code></example>
    public WithRawResponseTask<
        Dictionary<string, object?>
    > EndpointsObjectGetAndReturnMapOfDocumentedUnknownTypeAsync(
        Dictionary<string, object?> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<Dictionary<string, object?>>(
            EndpointsObjectGetAndReturnMapOfDocumentedUnknownTypeAsyncCore(
                request,
                options,
                cancellationToken
            )
        );
    }

    /// <summary>
    /// Tests that dynamic snippets include all required properties in the
    /// object initializer, even when the example omits some required fields.
    /// </summary>
    /// <example><code>
    /// await client.EndpointsObject.EndpointsObjectGetAndReturnWithMixedRequiredAndOptionalFieldsAsync(
    ///     new TypesObjectWithMixedRequiredAndOptionalFields
    ///     {
    ///         RequiredString = "requiredString",
    ///         RequiredInteger = 1,
    ///         RequiredLong = 1000000,
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<TypesObjectWithMixedRequiredAndOptionalFields> EndpointsObjectGetAndReturnWithMixedRequiredAndOptionalFieldsAsync(
        TypesObjectWithMixedRequiredAndOptionalFields request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<TypesObjectWithMixedRequiredAndOptionalFields>(
            EndpointsObjectGetAndReturnWithMixedRequiredAndOptionalFieldsAsyncCore(
                request,
                options,
                cancellationToken
            )
        );
    }

    /// <summary>
    /// Tests that dynamic snippets recursively construct default objects for
    /// required properties whose type is a named object. When the example
    /// omits the nested object, the generator should construct a default
    /// initializer with the nested object's required properties filled in.
    /// </summary>
    /// <example><code>
    /// await client.EndpointsObject.EndpointsObjectGetAndReturnWithRequiredNestedObjectAsync(
    ///     new TypesObjectWithRequiredNestedObject
    ///     {
    ///         RequiredString = "requiredString",
    ///         RequiredObject = new TypesNestedObjectWithRequiredField
    ///         {
    ///             String = "string",
    ///             NestedObject = new TypesObjectWithOptionalField(),
    ///         },
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<TypesObjectWithRequiredNestedObject> EndpointsObjectGetAndReturnWithRequiredNestedObjectAsync(
        TypesObjectWithRequiredNestedObject request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<TypesObjectWithRequiredNestedObject>(
            EndpointsObjectGetAndReturnWithRequiredNestedObjectAsyncCore(
                request,
                options,
                cancellationToken
            )
        );
    }

    /// <summary>
    /// Tests that string fields containing datetime-like values are NOT reformatted.
    /// The datetimeLikeString field should preserve its exact value "2023-08-31T14:15:22Z"
    /// without being converted to "2023-08-31T14:15:22.000Z".
    /// </summary>
    /// <example><code>
    /// await client.EndpointsObject.EndpointsObjectGetAndReturnWithDatetimeLikeStringAsync(
    ///     new TypesObjectWithDatetimeLikeString
    ///     {
    ///         DatetimeLikeString = "datetimeLikeString",
    ///         ActualDatetime = new DateTime(2024, 01, 15, 09, 30, 00, 000),
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<TypesObjectWithDatetimeLikeString> EndpointsObjectGetAndReturnWithDatetimeLikeStringAsync(
        TypesObjectWithDatetimeLikeString request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<TypesObjectWithDatetimeLikeString>(
            EndpointsObjectGetAndReturnWithDatetimeLikeStringAsyncCore(
                request,
                options,
                cancellationToken
            )
        );
    }
}
