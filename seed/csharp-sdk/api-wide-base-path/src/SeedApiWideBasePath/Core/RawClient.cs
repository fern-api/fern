using global::System.Net.Http;
using global::System.Net.Http.Headers;
using global::System.Text;
using SystemTask = global::System.Threading.Tasks.Task;

namespace SeedApiWideBasePath.Core;

/// <summary>
/// Utility class for making raw HTTP requests to the API.
/// </summary>
internal class RawClient(ClientOptions clientOptions)
{
    private const int MaxRetryDelayMs = 60000;
    internal int BaseRetryDelay { get; set; } = 1000;

    /// <summary>
    /// The client options applied on every request.
    /// </summary>
    internal readonly ClientOptions Options = clientOptions;

    [Obsolete("Use SendRequestAsync instead.")]
    internal Task<ApiResponse> MakeRequestAsync(
        BaseApiRequest request,
        CancellationToken cancellationToken = default
    )
    {
        return SendRequestAsync(request, cancellationToken);
    }

    internal async Task<ApiResponse> SendRequestAsync(
        BaseApiRequest request,
        CancellationToken cancellationToken = default
    )
    {
        // Apply the request timeout.
        var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        var timeout = request.Options?.Timeout ?? Options.Timeout;
        cts.CancelAfter(timeout);

        var httpRequest = CreateHttpRequest(request);
        // Send the request.
        return await SendWithRetriesAsync(httpRequest, request.Options, cts.Token)
            .ConfigureAwait(false);
    }

    internal async Task<ApiResponse> SendRequestAsync(
        HttpRequestMessage request,
        IRequestOptions? options,
        CancellationToken cancellationToken = default
    )
    {
        // Apply the request timeout.
        var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        var timeout = options?.Timeout ?? Options.Timeout;
        cts.CancelAfter(timeout);

        // Send the request.
        return await SendWithRetriesAsync(request, options, cts.Token).ConfigureAwait(false);
    }

    private static HttpRequestMessage CloneRequest(HttpRequestMessage request)
    {
        var clonedRequest = new HttpRequestMessage(request.Method, request.RequestUri);
        clonedRequest.Version = request.Version;
        clonedRequest.Content = request.Content;
        foreach (var header in request.Headers)
        {
            clonedRequest.Headers.TryAddWithoutValidation(header.Key, header.Value);
        }

        return clonedRequest;
    }

    internal record BaseApiRequest
    {
        internal required string BaseUrl { get; init; }

        internal required HttpMethod Method { get; init; }

        internal required string Path { get; init; }

        internal string? ContentType { get; init; }

        internal Dictionary<string, object> Query { get; init; } = new();

        internal Headers Headers { get; init; } = new();

        internal IRequestOptions? Options { get; init; }
    }

    /// <summary>
    /// The request object to be sent for streaming uploads.
    /// </summary>
    internal record StreamApiRequest : BaseApiRequest
    {
        internal Stream? Body { get; init; }
    }

    /// <summary>
    /// The request object to be sent for JSON APIs.
    /// </summary>
    internal record JsonApiRequest : BaseApiRequest
    {
        internal object? Body { get; init; }
    }

    /// <summary>
    /// The response object returned from the API.
    /// </summary>
    internal record ApiResponse
    {
        internal required int StatusCode { get; init; }

        internal required HttpResponseMessage Raw { get; init; }
    }

    private async Task<ApiResponse> SendWithRetriesAsync(
        HttpRequestMessage request,
        IRequestOptions? options,
        CancellationToken cancellationToken
    )
    {
        var httpClient = options?.HttpClient ?? Options.HttpClient;
        var maxRetries = options?.MaxRetries ?? Options.MaxRetries;
        var response = await httpClient.SendAsync(request, cancellationToken).ConfigureAwait(false);
        var isRetryableContent = IsRetryableContent(request);

        if (!isRetryableContent)
        {
            return new ApiResponse { StatusCode = (int)response.StatusCode, Raw = response };
        }

        for (var i = 0; i < maxRetries; i++)
        {
            if (!ShouldRetry(response))
            {
                break;
            }

            var delayMs = Math.Min(BaseRetryDelay * (int)Math.Pow(2, i), MaxRetryDelayMs);
            await SystemTask.Delay(delayMs, cancellationToken).ConfigureAwait(false);
            using var retryRequest = CloneRequest(request);
            response = await httpClient
                .SendAsync(retryRequest, cancellationToken)
                .ConfigureAwait(false);
        }

        return new ApiResponse { StatusCode = (int)response.StatusCode, Raw = response };
    }

    private static bool ShouldRetry(HttpResponseMessage response)
    {
        var statusCode = (int)response.StatusCode;
        return statusCode is 408 or 429 or >= 500;
    }

    private static bool IsRetryableContent(HttpRequestMessage request)
    {
        return request.Content switch
        {
            StreamContent or MultipartContent => false,
            _ => true,
        };
    }

    internal HttpRequestMessage CreateHttpRequest(BaseApiRequest request)
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
                if (
                    queryItem.Value
                    is global::System.Collections.IEnumerable collection
                        and not string
                )
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
