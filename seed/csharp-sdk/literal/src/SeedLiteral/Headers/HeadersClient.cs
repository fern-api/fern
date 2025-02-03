using System.Net.Http;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using SeedLiteral.Core;

namespace SeedLiteral;

public partial class HeadersClient
{
    private RawClient _client;

    internal HeadersClient(RawClient client)
    {
        _client = client;
    }

    /// <example>
    /// <code>
    /// await client.Headers.SendAsync(
    ///     new SendLiteralsInHeadersRequest
    ///     {
    ///         EndpointVersion = "02-12-2024",
    ///         Async = true,
    ///         Query = "What is the weather today",
    ///     }
    /// );
    /// </code>
    /// </example>
    public async Task<SendResponse> SendAsync(
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
        var requestBody = new Dictionary<string, object>() { { "query", request.Query } };
        var response = await _client
            .MakeRequestAsync(
                new RawClient.JsonApiRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = "headers",
                    Body = requestBody,
                    Headers = _headers,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            try
            {
                return JsonUtils.Deserialize<SendResponse>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedLiteralException("Failed to deserialize response", e);
            }
        }

        throw new SeedLiteralApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }
}
