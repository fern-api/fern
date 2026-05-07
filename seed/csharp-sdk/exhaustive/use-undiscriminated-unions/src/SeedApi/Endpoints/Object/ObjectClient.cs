using global::System.Text.Json;
using SeedApi;
using SeedApi.Core;

namespace SeedApi.Endpoints;

public partial class ObjectClient : IObjectClient
{
    private readonly RawClient _client;

    internal ObjectClient(RawClient client)
    {
        _client = client;
    }

    private async Task<
        WithRawResponse<TypesObjectWithOptionalField>
    > GetAndReturnWithOptionalFieldAsyncCore(
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
    > GetAndReturnWithRequiredFieldAsyncCore(
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

    private async Task<WithRawResponse<TypesObjectWithMapOfMap>> GetAndReturnWithMapOfMapAsyncCore(
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
    > GetAndReturnNestedWithOptionalFieldAsyncCore(
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
    > GetAndReturnNestedWithRequiredFieldAsyncCore(
        GetAndReturnNestedWithRequiredFieldObjectRequest request,
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
    > GetAndReturnNestedWithRequiredFieldAsListAsyncCore(
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
    > GetAndReturnWithUnknownFieldAsyncCore(
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
    > GetAndReturnWithDocumentedUnknownTypeAsyncCore(
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
    > GetAndReturnMapOfDocumentedUnknownTypeAsyncCore(
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
        WithRawResponse<TypesObjectWithDatetimeLikeString>
    > GetAndReturnWithDatetimeLikeStringAsyncCore(
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
    /// await client.Endpoints.Object.GetAndReturnWithOptionalFieldAsync(
    ///     new TypesObjectWithOptionalField()
    /// );
    /// </code></example>
    public WithRawResponseTask<TypesObjectWithOptionalField> GetAndReturnWithOptionalFieldAsync(
        TypesObjectWithOptionalField request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<TypesObjectWithOptionalField>(
            GetAndReturnWithOptionalFieldAsyncCore(request, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.Endpoints.Object.GetAndReturnWithRequiredFieldAsync(
    ///     new TypesObjectWithRequiredField { String = "string" }
    /// );
    /// </code></example>
    public WithRawResponseTask<TypesObjectWithRequiredField> GetAndReturnWithRequiredFieldAsync(
        TypesObjectWithRequiredField request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<TypesObjectWithRequiredField>(
            GetAndReturnWithRequiredFieldAsyncCore(request, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.Endpoints.Object.GetAndReturnWithMapOfMapAsync(
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
    public WithRawResponseTask<TypesObjectWithMapOfMap> GetAndReturnWithMapOfMapAsync(
        TypesObjectWithMapOfMap request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<TypesObjectWithMapOfMap>(
            GetAndReturnWithMapOfMapAsyncCore(request, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.Endpoints.Object.GetAndReturnNestedWithOptionalFieldAsync(
    ///     new TypesNestedObjectWithOptionalField()
    /// );
    /// </code></example>
    public WithRawResponseTask<TypesNestedObjectWithOptionalField> GetAndReturnNestedWithOptionalFieldAsync(
        TypesNestedObjectWithOptionalField request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<TypesNestedObjectWithOptionalField>(
            GetAndReturnNestedWithOptionalFieldAsyncCore(request, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.Endpoints.Object.GetAndReturnNestedWithRequiredFieldAsync(
    ///     new GetAndReturnNestedWithRequiredFieldObjectRequest
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
    public WithRawResponseTask<TypesNestedObjectWithRequiredField> GetAndReturnNestedWithRequiredFieldAsync(
        GetAndReturnNestedWithRequiredFieldObjectRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<TypesNestedObjectWithRequiredField>(
            GetAndReturnNestedWithRequiredFieldAsyncCore(request, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.Endpoints.Object.GetAndReturnNestedWithRequiredFieldAsListAsync(
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
    public WithRawResponseTask<TypesNestedObjectWithRequiredField> GetAndReturnNestedWithRequiredFieldAsListAsync(
        IEnumerable<TypesNestedObjectWithRequiredField> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<TypesNestedObjectWithRequiredField>(
            GetAndReturnNestedWithRequiredFieldAsListAsyncCore(request, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.Endpoints.Object.GetAndReturnWithUnknownFieldAsync(
    ///     new TypesObjectWithUnknownField
    ///     {
    ///         Unknown = new Dictionary&lt;object, object?&gt;() { { "key", "value" } },
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<TypesObjectWithUnknownField> GetAndReturnWithUnknownFieldAsync(
        TypesObjectWithUnknownField request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<TypesObjectWithUnknownField>(
            GetAndReturnWithUnknownFieldAsyncCore(request, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.Endpoints.Object.GetAndReturnWithDocumentedUnknownTypeAsync(
    ///     new TypesObjectWithDocumentedUnknownType
    ///     {
    ///         DocumentedUnknownType = new Dictionary&lt;object, object?&gt;() { { "key", "value" } },
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<TypesObjectWithDocumentedUnknownType> GetAndReturnWithDocumentedUnknownTypeAsync(
        TypesObjectWithDocumentedUnknownType request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<TypesObjectWithDocumentedUnknownType>(
            GetAndReturnWithDocumentedUnknownTypeAsyncCore(request, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.Endpoints.Object.GetAndReturnMapOfDocumentedUnknownTypeAsync(
    ///     new Dictionary&lt;string, object&gt;() { }
    /// );
    /// </code></example>
    public WithRawResponseTask<
        Dictionary<string, object?>
    > GetAndReturnMapOfDocumentedUnknownTypeAsync(
        Dictionary<string, object?> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<Dictionary<string, object?>>(
            GetAndReturnMapOfDocumentedUnknownTypeAsyncCore(request, options, cancellationToken)
        );
    }

    /// <summary>
    /// Tests that string fields containing datetime-like values are NOT reformatted.
    /// The datetimeLikeString field should preserve its exact value "2023-08-31T14:15:22Z"
    /// without being converted to "2023-08-31T14:15:22.000Z".
    /// </summary>
    /// <example><code>
    /// await client.Endpoints.Object.GetAndReturnWithDatetimeLikeStringAsync(
    ///     new TypesObjectWithDatetimeLikeString
    ///     {
    ///         DatetimeLikeString = "datetimeLikeString",
    ///         ActualDatetime = new DateTime(2024, 01, 15, 09, 30, 00, 000),
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<TypesObjectWithDatetimeLikeString> GetAndReturnWithDatetimeLikeStringAsync(
        TypesObjectWithDatetimeLikeString request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<TypesObjectWithDatetimeLikeString>(
            GetAndReturnWithDatetimeLikeStringAsyncCore(request, options, cancellationToken)
        );
    }
}
