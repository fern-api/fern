using SeedApi.Core;

namespace SeedApi;

public partial class ReqwithheadersClient : IReqwithheadersClient
{
    private readonly RawClient _client;

    internal ReqwithheadersClient(RawClient client)
    {
        _client = client;
    }

    /// <example><code>
    /// await client.Reqwithheaders.GetwithcustomheaderAsync(
    ///     new ReqWithHeadersGetWithCustomHeaderRequest
    ///     {
    ///         TestEndpointHeader = "X-TEST-ENDPOINT-HEADER",
    ///         Body = "string",
    ///     }
    /// );
    /// </code></example>
    public async Task GetwithcustomheaderAsync(
        ReqWithHeadersGetWithCustomHeaderRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedApi.Core.HeadersBuilder.Builder()
            .Add("X-TEST-ENDPOINT-HEADER", request.TestEndpointHeader)
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
                    Path = "test-headers/custom-header",
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
            return;
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
}
