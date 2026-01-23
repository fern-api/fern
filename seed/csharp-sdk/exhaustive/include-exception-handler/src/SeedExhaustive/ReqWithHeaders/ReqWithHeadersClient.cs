using SeedExhaustive.Core;

namespace SeedExhaustive;

public partial class ReqWithHeadersClient : IReqWithHeadersClient
{
    private RawClient _client;

    internal ReqWithHeadersClient(RawClient client)
    {
        try
        {
            _client = client;
        }
        catch (Exception ex)
        {
            client.Options.ExceptionHandler?.CaptureException(ex);
            throw;
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
    public async Task GetWithCustomHeaderAsync(
        ReqWithHeaders request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var _headers = await new SeedExhaustive.Core.HeadersBuilder.Builder()
                    .Add("X-TEST-SERVICE-HEADER", request.XTestServiceHeader)
                    .Add("X-TEST-ENDPOINT-HEADER", request.XTestEndpointHeader)
                    .Add(_client.Options.Headers)
                    .Add(_client.Options.AdditionalHeaders)
                    .Add(options?.Headers)
                    .Add(options?.AdditionalHeaders)
                    .BuildAsync()
                    .ConfigureAwait(false);
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
            })
            .ConfigureAwait(false);
    }
}
