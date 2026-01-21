using System.Text.Json;
using SeedLiteral.Core;

namespace SeedLiteral;

public partial class HeadersClient : IHeadersClient
{
    private RawClient _client;

    internal HeadersClient(RawClient client)
    {
        _client = client;
    }

    private async Task<WithRawResponse<SendResponse>> SendAsyncCore(
        SendLiteralsInHeadersRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Endpoint-Version", request.EndpointVersion.ToString() },
                { "X-Async", JsonUtils.Serialize(request.Async) },
            }
        );
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = "headers",
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
                var responseData = JsonUtils.Deserialize<SendResponse>(responseBody)!;
                return new WithRawResponse<SendResponse>()
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
                throw new SeedLiteralApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedLiteralApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.Headers.SendAsync(
    ///     new SendLiteralsInHeadersRequest
    ///     {
    ///         EndpointVersion = "02-12-2024",
    ///         Async = true,
    ///         Query = "What is the weather today",
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<SendResponse> SendAsync(
        SendLiteralsInHeadersRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<SendResponse>(
            SendAsyncCore(request, options, cancellationToken)
        );
    }
}
