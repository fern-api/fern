using System.Text.Json;
using SeedExhaustive;
using SeedExhaustive.Core;
using SeedExhaustive.Types.Object;

namespace SeedExhaustive.Endpoints.Object;

public partial class ObjectClient : IObjectClient
{
    private RawClient _client;

    internal ObjectClient(RawClient client)
    {
        _client = client;
    }

    private async Task<
        WithRawResponse<ObjectWithOptionalField>
    > GetAndReturnWithOptionalFieldAsyncCore(
        ObjectWithOptionalField request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = "/object/get-and-return-with-optional-field",
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
                var responseData = JsonUtils.Deserialize<ObjectWithOptionalField>(responseBody)!;
                return new WithRawResponse<ObjectWithOptionalField>()
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
    }

    private async Task<
        WithRawResponse<ObjectWithRequiredField>
    > GetAndReturnWithRequiredFieldAsyncCore(
        ObjectWithRequiredField request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = "/object/get-and-return-with-required-field",
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
                var responseData = JsonUtils.Deserialize<ObjectWithRequiredField>(responseBody)!;
                return new WithRawResponse<ObjectWithRequiredField>()
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
    }

    private async Task<WithRawResponse<ObjectWithMapOfMap>> GetAndReturnWithMapOfMapAsyncCore(
        ObjectWithMapOfMap request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = "/object/get-and-return-with-map-of-map",
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
                var responseData = JsonUtils.Deserialize<ObjectWithMapOfMap>(responseBody)!;
                return new WithRawResponse<ObjectWithMapOfMap>()
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
    }

    private async Task<
        WithRawResponse<NestedObjectWithOptionalField>
    > GetAndReturnNestedWithOptionalFieldAsyncCore(
        NestedObjectWithOptionalField request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = "/object/get-and-return-nested-with-optional-field",
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
                var responseData = JsonUtils.Deserialize<NestedObjectWithOptionalField>(
                    responseBody
                )!;
                return new WithRawResponse<NestedObjectWithOptionalField>()
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
    }

    private async Task<
        WithRawResponse<NestedObjectWithRequiredField>
    > GetAndReturnNestedWithRequiredFieldAsyncCore(
        string string_,
        NestedObjectWithRequiredField request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = string.Format(
                        "/object/get-and-return-nested-with-required-field/{0}",
                        ValueConvert.ToPathParameterString(string_)
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
                var responseData = JsonUtils.Deserialize<NestedObjectWithRequiredField>(
                    responseBody
                )!;
                return new WithRawResponse<NestedObjectWithRequiredField>()
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
    }

    private async Task<
        WithRawResponse<NestedObjectWithRequiredField>
    > GetAndReturnNestedWithRequiredFieldAsListAsyncCore(
        IEnumerable<NestedObjectWithRequiredField> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = "/object/get-and-return-nested-with-required-field-list",
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
                var responseData = JsonUtils.Deserialize<NestedObjectWithRequiredField>(
                    responseBody
                )!;
                return new WithRawResponse<NestedObjectWithRequiredField>()
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
    }

    /// <example><code>
    /// await client.Endpoints.Object.GetAndReturnWithOptionalFieldAsync(
    ///     new ObjectWithOptionalField
    ///     {
    ///         String = "string",
    ///         Integer = 1,
    ///         Long = 1000000,
    ///         Double = 1.1,
    ///         Bool = true,
    ///         Datetime = new DateTime(2024, 01, 15, 09, 30, 00, 000),
    ///         Date = new DateOnly(2023, 1, 15),
    ///         Uuid = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ///         Base64 = "SGVsbG8gd29ybGQh",
    ///         List = new List&lt;string&gt;() { "list", "list" },
    ///         Set = new HashSet&lt;string&gt;() { "set" },
    ///         Map = new Dictionary&lt;int, string&gt;() { { 1, "map" } },
    ///         Bigint = "1000000",
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<ObjectWithOptionalField> GetAndReturnWithOptionalFieldAsync(
        ObjectWithOptionalField request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<ObjectWithOptionalField>(
            GetAndReturnWithOptionalFieldAsyncCore(request, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.Endpoints.Object.GetAndReturnWithRequiredFieldAsync(
    ///     new ObjectWithRequiredField { String = "string" }
    /// );
    /// </code></example>
    public WithRawResponseTask<ObjectWithRequiredField> GetAndReturnWithRequiredFieldAsync(
        ObjectWithRequiredField request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<ObjectWithRequiredField>(
            GetAndReturnWithRequiredFieldAsyncCore(request, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.Endpoints.Object.GetAndReturnWithMapOfMapAsync(
    ///     new ObjectWithMapOfMap
    ///     {
    ///         Map = new Dictionary&lt;string, Dictionary&lt;string, string&gt;&gt;()
    ///         {
    ///             {
    ///                 "map",
    ///                 new Dictionary&lt;string, string&gt;() { { "map", "map" } }
    ///             },
    ///         },
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<ObjectWithMapOfMap> GetAndReturnWithMapOfMapAsync(
        ObjectWithMapOfMap request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<ObjectWithMapOfMap>(
            GetAndReturnWithMapOfMapAsyncCore(request, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.Endpoints.Object.GetAndReturnNestedWithOptionalFieldAsync(
    ///     new NestedObjectWithOptionalField
    ///     {
    ///         String = "string",
    ///         NestedObject = new ObjectWithOptionalField
    ///         {
    ///             String = "string",
    ///             Integer = 1,
    ///             Long = 1000000,
    ///             Double = 1.1,
    ///             Bool = true,
    ///             Datetime = new DateTime(2024, 01, 15, 09, 30, 00, 000),
    ///             Date = new DateOnly(2023, 1, 15),
    ///             Uuid = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ///             Base64 = "SGVsbG8gd29ybGQh",
    ///             List = new List&lt;string&gt;() { "list", "list" },
    ///             Set = new HashSet&lt;string&gt;() { "set" },
    ///             Map = new Dictionary&lt;int, string&gt;() { { 1, "map" } },
    ///             Bigint = "1000000",
    ///         },
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<NestedObjectWithOptionalField> GetAndReturnNestedWithOptionalFieldAsync(
        NestedObjectWithOptionalField request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<NestedObjectWithOptionalField>(
            GetAndReturnNestedWithOptionalFieldAsyncCore(request, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.Endpoints.Object.GetAndReturnNestedWithRequiredFieldAsync(
    ///     "string",
    ///     new NestedObjectWithRequiredField
    ///     {
    ///         String = "string",
    ///         NestedObject = new ObjectWithOptionalField
    ///         {
    ///             String = "string",
    ///             Integer = 1,
    ///             Long = 1000000,
    ///             Double = 1.1,
    ///             Bool = true,
    ///             Datetime = new DateTime(2024, 01, 15, 09, 30, 00, 000),
    ///             Date = new DateOnly(2023, 1, 15),
    ///             Uuid = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ///             Base64 = "SGVsbG8gd29ybGQh",
    ///             List = new List&lt;string&gt;() { "list", "list" },
    ///             Set = new HashSet&lt;string&gt;() { "set" },
    ///             Map = new Dictionary&lt;int, string&gt;() { { 1, "map" } },
    ///             Bigint = "1000000",
    ///         },
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<NestedObjectWithRequiredField> GetAndReturnNestedWithRequiredFieldAsync(
        string string_,
        NestedObjectWithRequiredField request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<NestedObjectWithRequiredField>(
            GetAndReturnNestedWithRequiredFieldAsyncCore(
                string_,
                request,
                options,
                cancellationToken
            )
        );
    }

    /// <example><code>
    /// await client.Endpoints.Object.GetAndReturnNestedWithRequiredFieldAsListAsync(
    ///     new List&lt;NestedObjectWithRequiredField&gt;()
    ///     {
    ///         new NestedObjectWithRequiredField
    ///         {
    ///             String = "string",
    ///             NestedObject = new ObjectWithOptionalField
    ///             {
    ///                 String = "string",
    ///                 Integer = 1,
    ///                 Long = 1000000,
    ///                 Double = 1.1,
    ///                 Bool = true,
    ///                 Datetime = new DateTime(2024, 01, 15, 09, 30, 00, 000),
    ///                 Date = new DateOnly(2023, 1, 15),
    ///                 Uuid = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ///                 Base64 = "SGVsbG8gd29ybGQh",
    ///                 List = new List&lt;string&gt;() { "list", "list" },
    ///                 Set = new HashSet&lt;string&gt;() { "set" },
    ///                 Map = new Dictionary&lt;int, string&gt;() { { 1, "map" } },
    ///                 Bigint = "1000000",
    ///             },
    ///         },
    ///         new NestedObjectWithRequiredField
    ///         {
    ///             String = "string",
    ///             NestedObject = new ObjectWithOptionalField
    ///             {
    ///                 String = "string",
    ///                 Integer = 1,
    ///                 Long = 1000000,
    ///                 Double = 1.1,
    ///                 Bool = true,
    ///                 Datetime = new DateTime(2024, 01, 15, 09, 30, 00, 000),
    ///                 Date = new DateOnly(2023, 1, 15),
    ///                 Uuid = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ///                 Base64 = "SGVsbG8gd29ybGQh",
    ///                 List = new List&lt;string&gt;() { "list", "list" },
    ///                 Set = new HashSet&lt;string&gt;() { "set" },
    ///                 Map = new Dictionary&lt;int, string&gt;() { { 1, "map" } },
    ///                 Bigint = "1000000",
    ///             },
    ///         },
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<NestedObjectWithRequiredField> GetAndReturnNestedWithRequiredFieldAsListAsync(
        IEnumerable<NestedObjectWithRequiredField> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<NestedObjectWithRequiredField>(
            GetAndReturnNestedWithRequiredFieldAsListAsyncCore(request, options, cancellationToken)
        );
    }
}
