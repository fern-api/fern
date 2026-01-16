using System.Text.Json;
using SeedApi.Core;

namespace SeedApi;

public partial class SeedApiClient : ISeedApiClient
{
    private readonly RawClient _client;

    public SeedApiClient(ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedApi" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernrequired-nullable/0.0.1" },
            }
        );
        clientOptions ??= new ClientOptions();
        foreach (var header in defaultHeaders)
        {
            if (!clientOptions.Headers.ContainsKey(header.Key))
            {
                clientOptions.Headers[header.Key] = header.Value;
            }
        }
        _client = new RawClient(clientOptions);
        Raw = new RawAccessClient(_client);
    }

    public SeedApiClient.RawAccessClient Raw { get; }

    /// <example><code>
    /// await client.GetFooAsync(
    ///     new GetFooRequest
    ///     {
    ///         RequiredBaz = "required_baz",
    ///         RequiredNullableBaz = "required_nullable_baz",
    ///     }
    /// );
    /// </code></example>
    public async Task<Foo> GetFooAsync(
        GetFooRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _query = new Dictionary<string, object>();
        _query["required_baz"] = request.RequiredBaz;
        if (request.OptionalBaz != null)
        {
            _query["optional_baz"] = request.OptionalBaz;
        }
        if (request.OptionalNullableBaz != null)
        {
            _query["optional_nullable_baz"] = request.OptionalNullableBaz;
        }
        if (request.RequiredNullableBaz != null)
        {
            _query["required_nullable_baz"] = request.RequiredNullableBaz;
        }
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = "foo",
                    Query = _query,
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
                return JsonUtils.Deserialize<Foo>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedApiException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedApiApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.UpdateFooAsync(
    ///     "id",
    ///     new UpdateFooRequest
    ///     {
    ///         XIdempotencyKey = "X-Idempotency-Key",
    ///         NullableText = "nullable_text",
    ///         NullableNumber = 1.1,
    ///         NonNullableText = "non_nullable_text",
    ///     }
    /// );
    /// </code></example>
    public async Task<Foo> UpdateFooAsync(
        string id,
        UpdateFooRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = new Headers(
            new Dictionary<string, string>() { { "X-Idempotency-Key", request.XIdempotencyKey } }
        );
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethodExtensions.Patch,
                    Path = string.Format("foo/{0}", ValueConvert.ToPathParameterString(id)),
                    Body = request,
                    Headers = _headers,
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
                return JsonUtils.Deserialize<Foo>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedApiException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedApiApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    public partial class RawAccessClient
    {
        private readonly RawClient _client;

        internal RawAccessClient(RawClient client)
        {
            _client = client;
        }

        private static IReadOnlyDictionary<string, IEnumerable<string>> ExtractHeaders(
            HttpResponseMessage response
        )
        {
            var headers = new Dictionary<string, IEnumerable<string>>(
                StringComparer.OrdinalIgnoreCase
            );
            foreach (var header in response.Headers)
            {
                headers[header.Key] = header.Value.ToList();
            }
            if (response.Content != null)
            {
                foreach (var header in response.Content.Headers)
                {
                    headers[header.Key] = header.Value.ToList();
                }
            }
            return headers;
        }

        public async Task<RawResponse<Foo>> GetFooAsync(
            GetFooRequest request,
            RequestOptions? options = null,
            CancellationToken cancellationToken = default
        )
        {
            var _query = new Dictionary<string, object>();
            _query["required_baz"] = request.RequiredBaz;
            if (request.OptionalBaz != null)
            {
                _query["optional_baz"] = request.OptionalBaz;
            }
            if (request.OptionalNullableBaz != null)
            {
                _query["optional_nullable_baz"] = request.OptionalNullableBaz;
            }
            if (request.RequiredNullableBaz != null)
            {
                _query["required_nullable_baz"] = request.RequiredNullableBaz;
            }
            var response = await _client
                .SendRequestAsync(
                    new JsonRequest
                    {
                        BaseUrl = _client.Options.BaseUrl,
                        Method = HttpMethod.Get,
                        Path = "foo",
                        Query = _query,
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
                    var body = JsonUtils.Deserialize<Foo>(responseBody)!;
                    return new RawResponse<Foo>
                    {
                        StatusCode = (global::System.Net.HttpStatusCode)response.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri!,
                        Headers = new ResponseHeaders(ExtractHeaders(response.Raw)),
                        Body = body,
                    };
                }
                catch (JsonException e)
                {
                    throw new SeedApiException("Failed to deserialize response", e);
                }
            }

            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                throw new SeedApiApiException(
                    $"Error with status code {response.StatusCode}",
                    response.StatusCode,
                    responseBody
                );
            }
        }

        public async Task<RawResponse<Foo>> UpdateFooAsync(
            string id,
            UpdateFooRequest request,
            RequestOptions? options = null,
            CancellationToken cancellationToken = default
        )
        {
            var _headers = new Headers(
                new Dictionary<string, string>()
                {
                    { "X-Idempotency-Key", request.XIdempotencyKey },
                }
            );
            var response = await _client
                .SendRequestAsync(
                    new JsonRequest
                    {
                        BaseUrl = _client.Options.BaseUrl,
                        Method = HttpMethodExtensions.Patch,
                        Path = string.Format("foo/{0}", ValueConvert.ToPathParameterString(id)),
                        Body = request,
                        Headers = _headers,
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
                    var body = JsonUtils.Deserialize<Foo>(responseBody)!;
                    return new RawResponse<Foo>
                    {
                        StatusCode = (global::System.Net.HttpStatusCode)response.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri!,
                        Headers = new ResponseHeaders(ExtractHeaders(response.Raw)),
                        Body = body,
                    };
                }
                catch (JsonException e)
                {
                    throw new SeedApiException("Failed to deserialize response", e);
                }
            }

            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                throw new SeedApiApiException(
                    $"Error with status code {response.StatusCode}",
                    response.StatusCode,
                    responseBody
                );
            }
        }
    }
}
