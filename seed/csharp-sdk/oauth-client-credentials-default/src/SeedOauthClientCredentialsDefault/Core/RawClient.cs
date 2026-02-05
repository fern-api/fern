using global::System.Net.Http;
using global::System.Net.Http.Headers;
using global::System.Text;
using SystemTask = global::System.Threading.Tasks.Task;

namespace SeedOauthClientCredentialsDefault.Core;

/// <summary>
/// Utility class for making raw HTTP requests to the API.
/// </summary>
internal partial class RawClient(ClientOptions clientOptions)
{
    private const int MaxRetryDelayMs = 60000;
    private const double JitterFactor = 0.2;
#if NET6_0_OR_GREATER
    // Use Random.Shared for thread-safe random number generation on .NET 6+
#else
    private static readonly object JitterLock = new();
    private static readonly Random JitterRandom = new();
#endif
    internal int BaseRetryDelay { get; set; } = 1000;

    /// <summary>
    /// The client options applied on every request.
    /// </summary>
    internal readonly ClientOptions Options = clientOptions;

    internal async global::System.Threading.Tasks.Task<global::SeedOauthClientCredentialsDefault.Core.ApiResponse> SendRequestAsync(
        global::SeedOauthClientCredentialsDefault.Core.BaseRequest request,
        CancellationToken cancellationToken = default
    )
    {
        // Apply the request timeout.
        using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        var timeout = request.Options?.Timeout ?? Options.Timeout;
        cts.CancelAfter(timeout);

        var httpRequest = await CreateHttpRequestAsync(request).ConfigureAwait(false);
        // Send the request.
        return await SendWithRetriesAsync(httpRequest, request.Options, cts.Token)
            .ConfigureAwait(false);
    }

    internal async global::System.Threading.Tasks.Task<global::SeedOauthClientCredentialsDefault.Core.ApiResponse> SendRequestAsync(
        HttpRequestMessage request,
        IRequestOptions? options,
        CancellationToken cancellationToken = default
    )
    {
        // Apply the request timeout.
        using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        var timeout = options?.Timeout ?? Options.Timeout;
        cts.CancelAfter(timeout);

        // Send the request.
        return await SendWithRetriesAsync(request, options, cts.Token).ConfigureAwait(false);
    }

    private static async global::System.Threading.Tasks.Task<HttpRequestMessage> CloneRequestAsync(
        HttpRequestMessage request
    )
    {
        var clonedRequest = new HttpRequestMessage(request.Method, request.RequestUri);
        clonedRequest.Version = request.Version;
        switch (request.Content)
        {
            case MultipartContent oldMultipartFormContent:
                var originalBoundary =
                    oldMultipartFormContent
                        .Headers.ContentType?.Parameters.First(p =>
                            p.Name.Equals("boundary", StringComparison.OrdinalIgnoreCase)
                        )
                        .Value?.Trim('"') ?? Guid.NewGuid().ToString();
                var newMultipartContent = oldMultipartFormContent switch
                {
                    MultipartFormDataContent => new MultipartFormDataContent(originalBoundary),
                    _ => new MultipartContent(),
                };
                foreach (var content in oldMultipartFormContent)
                {
                    var ms = new MemoryStream();
                    await content.CopyToAsync(ms).ConfigureAwait(false);
                    ms.Position = 0;
                    var newPart = new StreamContent(ms);
                    foreach (var header in oldMultipartFormContent.Headers)
                    {
                        newPart.Headers.TryAddWithoutValidation(header.Key, header.Value);
                    }

                    newMultipartContent.Add(newPart);
                }

                clonedRequest.Content = newMultipartContent;
                break;
            default:
                clonedRequest.Content = request.Content;
                break;
        }

        foreach (var header in request.Headers)
        {
            clonedRequest.Headers.TryAddWithoutValidation(header.Key, header.Value);
        }

        return clonedRequest;
    }

    /// <summary>
    /// Sends the request with retries, unless the request content is not retryable,
    /// such as stream requests and multipart form data with stream content.
    /// </summary>
    private async global::System.Threading.Tasks.Task<global::SeedOauthClientCredentialsDefault.Core.ApiResponse> SendWithRetriesAsync(
        HttpRequestMessage request,
        IRequestOptions? options,
        CancellationToken cancellationToken
    )
    {
        var httpClient = options?.HttpClient ?? Options.HttpClient;
        var maxRetries = options?.MaxRetries ?? Options.MaxRetries;
        var response = await httpClient
            .SendAsync(request, HttpCompletionOption.ResponseHeadersRead, cancellationToken)
            .ConfigureAwait(false);
        var isRetryableContent = IsRetryableContent(request);

        if (!isRetryableContent)
        {
            return new global::SeedOauthClientCredentialsDefault.Core.ApiResponse
            {
                StatusCode = (int)response.StatusCode,
                Raw = response,
            };
        }

        for (var i = 0; i < maxRetries; i++)
        {
            if (!ShouldRetry(response))
            {
                break;
            }

            var delayMs = GetRetryDelayFromHeaders(response, i);
            await SystemTask.Delay(delayMs, cancellationToken).ConfigureAwait(false);
            using var retryRequest = await CloneRequestAsync(request).ConfigureAwait(false);
            response = await httpClient
                .SendAsync(
                    retryRequest,
                    HttpCompletionOption.ResponseHeadersRead,
                    cancellationToken
                )
                .ConfigureAwait(false);
        }

        return new global::SeedOauthClientCredentialsDefault.Core.ApiResponse
        {
            StatusCode = (int)response.StatusCode,
            Raw = response,
        };
    }

    private static bool ShouldRetry(HttpResponseMessage response)
    {
        var statusCode = (int)response.StatusCode;
        return statusCode is 408 or 429 or >= 500;
    }

    private static int AddPositiveJitter(int delayMs)
    {
#if NET6_0_OR_GREATER
        var random = Random.Shared.NextDouble();
#else
        double random;
        lock (JitterLock)
        {
            random = JitterRandom.NextDouble();
        }
#endif
        var jitterMultiplier = 1 + random * JitterFactor;
        return (int)(delayMs * jitterMultiplier);
    }

    private static int AddSymmetricJitter(int delayMs)
    {
#if NET6_0_OR_GREATER
        var random = Random.Shared.NextDouble();
#else
        double random;
        lock (JitterLock)
        {
            random = JitterRandom.NextDouble();
        }
#endif
        var jitterMultiplier = 1 + (random - 0.5) * JitterFactor;
        return (int)(delayMs * jitterMultiplier);
    }

    private int GetRetryDelayFromHeaders(HttpResponseMessage response, int retryAttempt)
    {
        if (response.Headers.TryGetValues("Retry-After", out var retryAfterValues))
        {
            var retryAfter = retryAfterValues.FirstOrDefault();
            if (!string.IsNullOrEmpty(retryAfter))
            {
                if (int.TryParse(retryAfter, out var retryAfterSeconds) && retryAfterSeconds > 0)
                {
                    return Math.Min(retryAfterSeconds * 1000, MaxRetryDelayMs);
                }

                if (DateTimeOffset.TryParse(retryAfter, out var retryAfterDate))
                {
                    var delay = (int)(retryAfterDate - DateTimeOffset.UtcNow).TotalMilliseconds;
                    if (delay > 0)
                    {
                        return Math.Min(delay, MaxRetryDelayMs);
                    }
                }
            }
        }

        if (response.Headers.TryGetValues("X-RateLimit-Reset", out var rateLimitResetValues))
        {
            var rateLimitReset = rateLimitResetValues.FirstOrDefault();
            if (
                !string.IsNullOrEmpty(rateLimitReset)
                && long.TryParse(rateLimitReset, out var resetTime)
            )
            {
                var resetDateTime = DateTimeOffset.FromUnixTimeSeconds(resetTime);
                var delay = (int)(resetDateTime - DateTimeOffset.UtcNow).TotalMilliseconds;
                if (delay > 0)
                {
                    return AddPositiveJitter(Math.Min(delay, MaxRetryDelayMs));
                }
            }
        }

        var exponentialDelay = Math.Min(BaseRetryDelay * (1 << retryAttempt), MaxRetryDelayMs);
        return AddSymmetricJitter(exponentialDelay);
    }

    private static bool IsRetryableContent(HttpRequestMessage request)
    {
        return request.Content switch
        {
            IIsRetryableContent c => c.IsRetryable,
            StreamContent => false,
            MultipartContent content => !content.Any(c => c is StreamContent),
            _ => true,
        };
    }

    internal async global::System.Threading.Tasks.Task<HttpRequestMessage> CreateHttpRequestAsync(
        global::SeedOauthClientCredentialsDefault.Core.BaseRequest request
    )
    {
        var url = BuildUrl(request);
        var httpRequest = new HttpRequestMessage(request.Method, url);
        httpRequest.Content = request.CreateContent();
        SetHeaders(httpRequest, request.Headers);

        return httpRequest;
    }

    private static string BuildUrl(
        global::SeedOauthClientCredentialsDefault.Core.BaseRequest request
    )
    {
        var baseUrl = request.Options?.BaseUrl ?? request.BaseUrl;
        var trimmedBaseUrl = baseUrl.TrimEnd('/');
        var trimmedBasePath = request.Path.TrimStart('/');
        var url = $"{trimmedBaseUrl}/{trimmedBasePath}";

        // Append query string if present
        if (!string.IsNullOrEmpty(request.QueryString))
        {
            return url + request.QueryString;
        }

        return url;
    }

    private void SetHeaders(HttpRequestMessage httpRequest, Dictionary<string, string>? headers)
    {
        if (headers is null)
        {
            return;
        }

        foreach (var kv in headers)
        {
            if (kv.Value is null)
            {
                continue;
            }

            httpRequest.Headers.TryAddWithoutValidation(kv.Key, kv.Value);
        }
    }

    private static (Encoding encoding, string? charset, string mediaType) ParseContentTypeOrDefault(
        string? contentType,
        Encoding encodingFallback,
        string mediaTypeFallback
    )
    {
        var encoding = encodingFallback;
        var mediaType = mediaTypeFallback;
        string? charset = null;
        if (string.IsNullOrEmpty(contentType))
        {
            return (encoding, charset, mediaType);
        }

        if (!MediaTypeHeaderValue.TryParse(contentType, out var mediaTypeHeaderValue))
        {
            return (encoding, charset, mediaType);
        }

        if (!string.IsNullOrEmpty(mediaTypeHeaderValue.CharSet))
        {
            charset = mediaTypeHeaderValue.CharSet;
            encoding = Encoding.GetEncoding(mediaTypeHeaderValue.CharSet);
        }

        if (!string.IsNullOrEmpty(mediaTypeHeaderValue.MediaType))
        {
            mediaType = mediaTypeHeaderValue.MediaType;
        }

        return (encoding, charset, mediaType);
    }
}
