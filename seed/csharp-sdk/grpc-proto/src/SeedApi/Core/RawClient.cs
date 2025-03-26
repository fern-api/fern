using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading;
using SystemTask = System.Threading.Tasks.Task;

namespace SeedApi.Core;

/// <summary>
/// Utility class for making raw HTTP requests to the API.
/// </summary>
internal class RawClient(ClientOptions clientOptions)
{
    private const int MaxRetryDelayMs = 60000;
    internal int BaseRetryDelay { get; set; } = 1000;

    private readonly Lazy<RawGrpcClient> _grpc = new(() => new RawGrpcClient(clientOptions));

    /// <summary>
    /// The gRPC client used to make requests.
    /// </summary>
    public RawGrpcClient Grpc => _grpc.Value;

    /// <summary>
    /// The client options applied on every request.
    /// </summary>
    public readonly ClientOptions Options = clientOptions;

    public async Task<ApiResponse> MakeRequestAsync(
        BaseApiRequest request,
        CancellationToken cancellationToken = default
    )
    {
        // Apply the request timeout.
        var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        var timeout = request.Options?.Timeout ?? Options.Timeout;
        cts.CancelAfter(timeout);

        // Send the request.
        return await SendWithRetriesAsync(request, cts.Token).ConfigureAwait(false);
    }

    public record BaseApiRequest
    {
        public required string BaseUrl { get; init; }

        public required HttpMethod Method { get; init; }

        public required string Path { get; init; }

        public string? ContentType { get; init; }

        public Dictionary<string, object> Query { get; init; } = new();

        public Headers Headers { get; init; } = new();

        public IRequestOptions? Options { get; init; }
    }

    /// <summary>
    /// The request object to be sent for streaming uploads.
    /// </summary>
    public record StreamApiRequest : BaseApiRequest
    {
        public Stream? Body { get; init; }
    }

    /// <summary>
    /// The request object to be sent for JSON APIs.
    /// </summary>
    public record JsonApiRequest : BaseApiRequest
    {
        public object? Body { get; init; }
    }

    /// <summary>
    /// The response object returned from the API.
    /// </summary>
    public record ApiResponse
    {
        public required int StatusCode { get; init; }

        public required HttpResponseMessage Raw { get; init; }
    }

    private async Task<ApiResponse> SendWithRetriesAsync(
        BaseApiRequest request,
        CancellationToken cancellationToken
    )
    {
        var httpClient = request.Options?.HttpClient ?? Options.HttpClient;
        var maxRetries = request.Options?.MaxRetries ?? Options.MaxRetries;
        var response = await httpClient
            .SendAsync(BuildHttpRequest(request), cancellationToken)
            .ConfigureAwait(false);
        for (var i = 0; i < maxRetries; i++)
        {
            if (!ShouldRetry(response))
            {
                break;
            }
            var delayMs = Math.Min(BaseRetryDelay * (int)Math.Pow(2, i), MaxRetryDelayMs);
            await SystemTask.Delay(delayMs, cancellationToken).ConfigureAwait(false);
            response = await httpClient
                .SendAsync(BuildHttpRequest(request), cancellationToken)
                .ConfigureAwait(false);
        }
        return new ApiResponse { StatusCode = (int)response.StatusCode, Raw = response };
    }

    private static bool ShouldRetry(HttpResponseMessage response)
    {
        var statusCode = (int)response.StatusCode;
        return statusCode is 408 or 429 or >= 500;
    }

    private HttpRequestMessage BuildHttpRequest(BaseApiRequest request)
    {
        var url = BuildUrl(request);
        var httpRequest = new HttpRequestMessage(request.Method, url);
        switch (request)
        {
            // Add the request body to the request.
            case JsonApiRequest jsonRequest:
            {
                if (jsonRequest.Body != null)
                {
                    httpRequest.Content = new StringContent(
                        JsonUtils.Serialize(jsonRequest.Body),
                        Encoding.UTF8,
                        "application/json"
                    );
                }
                break;
            }
            case StreamApiRequest { Body: not null } streamRequest:
                httpRequest.Content = new StreamContent(streamRequest.Body);
                break;
        }
        if (request.ContentType != null)
        {
            httpRequest.Content.Headers.ContentType = MediaTypeHeaderValue.Parse(
                request.ContentType
            );
        }
        SetHeaders(httpRequest, Options.Headers);
        SetHeaders(httpRequest, request.Headers);
        SetHeaders(httpRequest, request.Options?.Headers ?? new Headers());

        return httpRequest;
    }

    private static string BuildUrl(BaseApiRequest request)
    {
        var baseUrl = request.Options?.BaseUrl ?? request.BaseUrl;
        var trimmedBaseUrl = baseUrl.TrimEnd('/');
        var trimmedBasePath = request.Path.TrimStart('/');
        var url = $"{trimmedBaseUrl}/{trimmedBasePath}";
        if (request.Query.Count <= 0)
            return url;
        url += "?";
        url = request.Query.Aggregate(
            url,
            (current, queryItem) =>
            {
                if (queryItem.Value is System.Collections.IEnumerable collection and not string)
                {
                    var items = collection
                        .Cast<object>()
                        .Select(value => $"{queryItem.Key}={value}")
                        .ToList();
                    if (items.Any())
                    {
                        current += string.Join("&", items) + "&";
                    }
                }
                else
                {
                    current += $"{queryItem.Key}={queryItem.Value}&";
                }
                return current;
            }
        );
        url = url[..^1];
        return url;
    }

    private static void SetHeaders(HttpRequestMessage httpRequest, Headers headers)
    {
        foreach (var header in headers)
        {
            var value = header.Value?.Match(str => str, func => func.Invoke());
            if (value != null)
            {
                httpRequest.Headers.TryAddWithoutValidation(header.Key, value);
            }
        }
    }
}
