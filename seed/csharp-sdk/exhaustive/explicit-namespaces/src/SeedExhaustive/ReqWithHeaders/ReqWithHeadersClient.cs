using SeedExhaustive;
using SeedExhaustive.Core;

namespace SeedExhaustive.ReqWithHeaders;

public partial class ReqWithHeadersClient
{
    private RawClient _client;

    internal ReqWithHeadersClient(RawClient client)
    {
        _client = client;
    }

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
}
