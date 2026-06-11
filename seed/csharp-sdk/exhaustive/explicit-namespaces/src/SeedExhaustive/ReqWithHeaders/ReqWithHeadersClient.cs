using SeedExhaustive;
using SeedExhaustive.Core;

namespace SeedExhaustive.ReqWithHeaders;

public partial class ReqWithHeadersClient : IReqWithHeadersClient
{
    private readonly RawClient _client;

    internal ReqWithHeadersClient(RawClient client)
    {
        _client = client;
    }

    private async Task<RawResponse> GetWithCustomHeaderAsyncCore(
        ReqWithHeaders request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedExhaustive.Core.HeadersBuilder.Builder()
            .Add("X-TEST-SERVICE-HEADER", request.XTestServiceHeader)
            .Add("X-TEST-ENDPOINT-HEADER", request.XTestEndpointHeader)
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
            return new SeedExhaustive.RawResponse()
            {
                StatusCode = response.Raw.StatusCode,
                Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
            };
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedExhaustiveApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody,
                rawResponse: new SeedExhaustive.RawResponse()
                {
                    StatusCode = response.Raw.StatusCode,
                    Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                    Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                }
            );
        }
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
    public WithRawResponseTask GetWithCustomHeaderAsync(
        ReqWithHeaders request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask(
            GetWithCustomHeaderAsyncCore(request, options, cancellationToken)
        );
    }
}
