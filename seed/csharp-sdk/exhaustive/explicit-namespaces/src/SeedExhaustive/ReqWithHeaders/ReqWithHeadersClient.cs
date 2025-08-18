using System.Net.Http;
using System.Threading;
using global::System.Threading.Tasks;
using SeedExhaustive;
using SeedExhaustive.Core;

namespace SeedExhaustive.ReqWithHeaders;

public partial class ReqWithHeadersClient
{
    private SeedExhaustive.Core.RawClient _client;

    internal ReqWithHeadersClient(SeedExhaustive.Core.RawClient client)
    {
        _client = client;
    }

    /// <example><code>
    /// await client.ReqWithHeaders.GetWithCustomHeaderAsync(
    ///     new SeedExhaustive.ReqWithHeaders.ReqWithHeaders
    ///     {
    ///         XTestEndpointHeader = "X-TEST-ENDPOINT-HEADER",
    ///         XTestServiceHeader = "X-TEST-SERVICE-HEADER",
    ///         Body = "string",
    ///     }
    /// );
    /// </code></example>
    public async global::System.Threading.Tasks.Task GetWithCustomHeaderAsync(
        SeedExhaustive.ReqWithHeaders.ReqWithHeaders request,
        SeedExhaustive.RequestOptions? options = null,
        System.Threading.CancellationToken cancellationToken = default
    )
    {
        var _headers = new SeedExhaustive.Core.Headers(
            new Dictionary<string, string>()
            {
                { "X-TEST-SERVICE-HEADER", request.XTestServiceHeader },
                { "X-TEST-ENDPOINT-HEADER", request.XTestEndpointHeader },
            }
        );
        var response = await _client
            .SendRequestAsync(
                new SeedExhaustive.Core.JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = System.Net.Http.HttpMethod.Post,
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
            throw new SeedExhaustive.SeedExhaustiveApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }
}
