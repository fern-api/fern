using SeedExhaustive;
using SeedExhaustive.Core;

namespace SeedExhaustive.ReqWithHeaders;

public partial class ReqWithHeadersClient : IReqWithHeadersClient
{
    private RawClient _client;

    internal ReqWithHeadersClient(RawClient client)
    {
        _client = client;
        Raw = new RawAccessClient(_client);
    }

    public ReqWithHeadersClient.RawAccessClient Raw { get; }

    /// <example><code>
    /// await client.ReqWithHeaders.GetWithCustomHeaderAsync(
    ///     new ReqWithHeaders
    ///     {
    ///         XTestEndpointHeader = "X-TEST-ENDPOINT-HEADER",
    ///         XTestServiceHeader = "X-TEST-SERVICE-HEADER",
    ///         Body = "string",
    ///     }
    /// );
    /// </code></example>
    public async Task GetWithCustomHeaderAsync(
        ReqWithHeaders request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = new Headers(
            new Dictionary<string, string>()
            {
                { "X-TEST-SERVICE-HEADER", request.XTestServiceHeader },
                { "X-TEST-ENDPOINT-HEADER", request.XTestEndpointHeader },
            }
        );
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = "/test-headers/custom-header",
                    Body = request.Body,
                    Headers = _headers,
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

        public async Task<RawResponse<object>> GetWithCustomHeaderAsync(
            ReqWithHeaders request,
            RequestOptions? options = null,
            CancellationToken cancellationToken = default
        )
        {
            var _headers = new Headers(
                new Dictionary<string, string>()
                {
                    { "X-TEST-SERVICE-HEADER", request.XTestServiceHeader },
                    { "X-TEST-ENDPOINT-HEADER", request.XTestEndpointHeader },
                }
            );
            var response = await _client
                .SendRequestAsync(
                    new JsonRequest
                    {
                        BaseUrl = _client.Options.BaseUrl,
                        Method = HttpMethod.Post,
                        Path = "/test-headers/custom-header",
                        Body = request.Body,
                        Headers = _headers,
                        Options = options,
                    },
                    cancellationToken
                )
                .ConfigureAwait(false);
            if (response.StatusCode is >= 200 and < 400)
            {
                return new RawResponse<object>
                {
                    StatusCode = (global::System.Net.HttpStatusCode)response.StatusCode,
                    Url = response.Raw.RequestMessage?.RequestUri!,
                    Headers = ExtractHeaders(response.Raw),
                    Body = new object(),
                };
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
    }
}
