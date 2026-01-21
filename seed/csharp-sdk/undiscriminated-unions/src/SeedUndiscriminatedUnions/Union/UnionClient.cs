using System.Text.Json;
using OneOf;
using SeedUndiscriminatedUnions.Core;

namespace SeedUndiscriminatedUnions;

public partial class UnionClient : IUnionClient
{
    private RawClient _client;

    internal UnionClient(RawClient client)
    {
        _client = client;
    }

    private async Task<
        WithRawResponse<
            OneOf<
                string,
                IEnumerable<string>,
                int,
                IEnumerable<int>,
                IEnumerable<IEnumerable<int>>,
                HashSet<string>
            >
        >
    > GetAsyncCore(
        OneOf<
            string,
            IEnumerable<string>,
            int,
            IEnumerable<int>,
            IEnumerable<IEnumerable<int>>,
            HashSet<string>
        > request,
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
                    Path = "",
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
                var responseData = JsonUtils.Deserialize<
                    OneOf<
                        string,
                        IEnumerable<string>,
                        int,
                        IEnumerable<int>,
                        IEnumerable<IEnumerable<int>>,
                        HashSet<string>
                    >
                >(responseBody)!;
                return new WithRawResponse<
                    OneOf<
                        string,
                        IEnumerable<string>,
                        int,
                        IEnumerable<int>,
                        IEnumerable<IEnumerable<int>>,
                        HashSet<string>
                    >
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
                throw new SeedUndiscriminatedUnionsApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedUndiscriminatedUnionsApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    private async Task<
        WithRawResponse<Dictionary<OneOf<KeyType, string>, string>>
    > GetMetadataAsyncCore(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = "/metadata",
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
                var responseData = JsonUtils.Deserialize<
                    Dictionary<OneOf<KeyType, string>, string>
                >(responseBody)!;
                return new WithRawResponse<Dictionary<OneOf<KeyType, string>, string>>()
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
                throw new SeedUndiscriminatedUnionsApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedUndiscriminatedUnionsApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    private async Task<WithRawResponse<bool>> UpdateMetadataAsyncCore(
        OneOf<Dictionary<string, object?>?, NamedMetadata> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Put,
                    Path = "/metadata",
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
                throw new SeedUndiscriminatedUnionsApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedUndiscriminatedUnionsApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    private async Task<WithRawResponse<bool>> CallAsyncCore(
        Request request,
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
                    Path = "/call",
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
                throw new SeedUndiscriminatedUnionsApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedUndiscriminatedUnionsApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    private async Task<
        WithRawResponse<OneOf<string, IEnumerable<string>, int, HashSet<string>>>
    > DuplicateTypesUnionAsyncCore(
        OneOf<string, IEnumerable<string>, int, HashSet<string>> request,
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
                    Path = "/duplicate",
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
                var responseData = JsonUtils.Deserialize<
                    OneOf<string, IEnumerable<string>, int, HashSet<string>>
                >(responseBody)!;
                return new WithRawResponse<
                    OneOf<string, IEnumerable<string>, int, HashSet<string>>
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
                throw new SeedUndiscriminatedUnionsApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedUndiscriminatedUnionsApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    private async Task<WithRawResponse<string>> NestedUnionsAsyncCore(
        OneOf<
            string,
            IEnumerable<string>,
            OneOf<
                int,
                HashSet<string>,
                IEnumerable<string>,
                OneOf<bool, HashSet<string>, IEnumerable<string>>
            >
        > request,
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
                    Path = "/nested",
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
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
            }
            catch (JsonException e)
            {
                throw new SeedUndiscriminatedUnionsApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedUndiscriminatedUnionsApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    private async Task<WithRawResponse<string>> TestCamelCasePropertiesAsyncCore(
        PaymentRequest request,
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
                    Path = "/camel-case",
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
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
            }
            catch (JsonException e)
            {
                throw new SeedUndiscriminatedUnionsApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedUndiscriminatedUnionsApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.Union.GetAsync("string");
    /// </code></example>
    public WithRawResponseTask<
        OneOf<
            string,
            IEnumerable<string>,
            int,
            IEnumerable<int>,
            IEnumerable<IEnumerable<int>>,
            HashSet<string>
        >
    > GetAsync(
        OneOf<
            string,
            IEnumerable<string>,
            int,
            IEnumerable<int>,
            IEnumerable<IEnumerable<int>>,
            HashSet<string>
        > request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<
            OneOf<
                string,
                IEnumerable<string>,
                int,
                IEnumerable<int>,
                IEnumerable<IEnumerable<int>>,
                HashSet<string>
            >
        >(GetAsyncCore(request, options, cancellationToken));
    }

    /// <example><code>
    /// await client.Union.GetMetadataAsync();
    /// </code></example>
    public WithRawResponseTask<Dictionary<OneOf<KeyType, string>, string>> GetMetadataAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<Dictionary<OneOf<KeyType, string>, string>>(
            GetMetadataAsyncCore(options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.Union.UpdateMetadataAsync(
    ///     new Dictionary&lt;string, object?&gt;()
    ///     {
    ///         {
    ///             "string",
    ///             new Dictionary&lt;object, object?&gt;() { { "key", "value" } }
    ///         },
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<bool> UpdateMetadataAsync(
        OneOf<Dictionary<string, object?>?, NamedMetadata> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<bool>(
            UpdateMetadataAsyncCore(request, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.Union.CallAsync(
    ///     new Request
    ///     {
    ///         Union = new Dictionary&lt;string, object?&gt;()
    ///         {
    ///             {
    ///                 "string",
    ///                 new Dictionary&lt;object, object?&gt;() { { "key", "value" } }
    ///             },
    ///         },
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<bool> CallAsync(
        Request request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<bool>(CallAsyncCore(request, options, cancellationToken));
    }

    /// <example><code>
    /// await client.Union.DuplicateTypesUnionAsync("string");
    /// </code></example>
    public WithRawResponseTask<
        OneOf<string, IEnumerable<string>, int, HashSet<string>>
    > DuplicateTypesUnionAsync(
        OneOf<string, IEnumerable<string>, int, HashSet<string>> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<OneOf<string, IEnumerable<string>, int, HashSet<string>>>(
            DuplicateTypesUnionAsyncCore(request, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.Union.NestedUnionsAsync("string");
    /// </code></example>
    public WithRawResponseTask<string> NestedUnionsAsync(
        OneOf<
            string,
            IEnumerable<string>,
            OneOf<
                int,
                HashSet<string>,
                IEnumerable<string>,
                OneOf<bool, HashSet<string>, IEnumerable<string>>
            >
        > request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<string>(
            NestedUnionsAsyncCore(request, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.Union.TestCamelCasePropertiesAsync(
    ///     new PaymentRequest
    ///     {
    ///         PaymentMethod = new TokenizeCard { Method = "card", CardNumber = "1234567890123456" },
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<string> TestCamelCasePropertiesAsync(
        PaymentRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<string>(
            TestCamelCasePropertiesAsyncCore(request, options, cancellationToken)
        );
    }
}
