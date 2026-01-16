using System.Text.Json;
using SeedUnknownAsAny.Core;

namespace SeedUnknownAsAny;

public partial class UnknownClient : IUnknownClient
{
    private RawClient _client;

    internal UnknownClient(RawClient client)
    {
        _client = client;
        Raw = new RawAccessClient(_client);
    }

    public UnknownClient.RawAccessClient Raw { get; }

    /// <example><code>
    /// await client.Unknown.PostAsync(new Dictionary&lt;object, object?&gt;() { { "key", "value" } });
    /// </code></example>
    public async Task<IEnumerable<object>> PostAsync(
        object request,
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
                return JsonUtils.Deserialize<IEnumerable<object>>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedUnknownAsAnyException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedUnknownAsAnyApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.Unknown.PostObjectAsync(
    ///     new MyObject { Unknown = new Dictionary&lt;object, object?&gt;() { { "key", "value" } } }
    /// );
    /// </code></example>
    public async Task<IEnumerable<object>> PostObjectAsync(
        MyObject request,
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
                    Path = "/with-object",
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
                return JsonUtils.Deserialize<IEnumerable<object>>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedUnknownAsAnyException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedUnknownAsAnyApiException(
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

        public async Task<RawResponse<IEnumerable<object>>> PostAsync(
            object request,
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
                    var body = JsonUtils.Deserialize<IEnumerable<object>>(responseBody)!;
                    return new RawResponse<IEnumerable<object>>
                    {
                        StatusCode = (System.Net.HttpStatusCode)response.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri!,
                        Headers = ExtractHeaders(response.Raw),
                        Body = body,
                    };
                }
                catch (JsonException e)
                {
                    throw new SeedUnknownAsAnyException("Failed to deserialize response", e);
                }
            }

            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                throw new SeedUnknownAsAnyApiException(
                    $"Error with status code {response.StatusCode}",
                    response.StatusCode,
                    responseBody
                );
            }
        }

        public async Task<RawResponse<IEnumerable<object>>> PostObjectAsync(
            MyObject request,
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
                        Path = "/with-object",
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
                    var body = JsonUtils.Deserialize<IEnumerable<object>>(responseBody)!;
                    return new RawResponse<IEnumerable<object>>
                    {
                        StatusCode = (System.Net.HttpStatusCode)response.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri!,
                        Headers = ExtractHeaders(response.Raw),
                        Body = body,
                    };
                }
                catch (JsonException e)
                {
                    throw new SeedUnknownAsAnyException("Failed to deserialize response", e);
                }
            }

            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                throw new SeedUnknownAsAnyApiException(
                    $"Error with status code {response.StatusCode}",
                    response.StatusCode,
                    responseBody
                );
            }
        }
    }
}
