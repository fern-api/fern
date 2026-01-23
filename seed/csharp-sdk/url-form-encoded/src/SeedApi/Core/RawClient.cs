using global::System.Net.Http;
using global::System.Net.Http.Headers;
using global::System.Text;
using SystemTask = global::System.Threading.Tasks.Task;

namespace SeedApi.Core;

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

    [Obsolete("Use SendRequestAsync instead.")]
    internal global::System.Threading.Tasks.Task<global::SeedApi.Core.ApiResponse> MakeRequestAsync(
        global::SeedApi.Core.BaseRequest request,
        CancellationToken cancellationToken = default
    )
    {
        return SendRequestAsync(request, cancellationToken);
    }

    internal async global::System.Threading.Tasks.Task<global::SeedApi.Core.ApiResponse> SendRequestAsync(
        global::SeedApi.Core.BaseRequest request,
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

    internal async global::System.Threading.Tasks.Task<global::SeedApi.Core.ApiResponse> SendRequestAsync(
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
    private async global::System.Threading.Tasks.Task<global::SeedApi.Core.ApiResponse> SendWithRetriesAsync(
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
            return new global::SeedApi.Core.ApiResponse
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

        return new global::SeedApi.Core.ApiResponse
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
        global::SeedApi.Core.BaseRequest request
    )
    {
        var url = BuildUrl(request);
        var httpRequest = new HttpRequestMessage(request.Method, url);
        httpRequest.Content = request.CreateContent();
        var mergedHeaders = new Dictionary<string, List<string>>();
        await MergeHeadersAsync(mergedHeaders, Options.Headers).ConfigureAwait(false);
        MergeAdditionalHeaders(mergedHeaders, Options.AdditionalHeaders);
        await MergeHeadersAsync(mergedHeaders, request.Headers).ConfigureAwait(false);
        await MergeHeadersAsync(mergedHeaders, request.Options?.Headers).ConfigureAwait(false);

        MergeAdditionalHeaders(mergedHeaders, request.Options?.AdditionalHeaders ?? []);
        SetHeaders(httpRequest, mergedHeaders);
        return httpRequest;
    }

    private static string BuildUrl(global::SeedApi.Core.BaseRequest request)
    {
        var baseUrl = request.Options?.BaseUrl ?? request.BaseUrl;
        var trimmedBaseUrl = baseUrl.TrimEnd('/');
        var trimmedBasePath = request.Path.TrimStart('/');
        var url = $"{trimmedBaseUrl}/{trimmedBasePath}";

        // Use pre-built query string if available (from QueryStringBuilder.Builder)
        if (!string.IsNullOrEmpty(request.QueryString))
        {
            return url
                + GetQueryStringWithAdditionalParameters(
                    request.QueryString,
                    request.Options?.AdditionalQueryParameters
                );
        }

        // Fall back to dictionary-based query parameters (legacy)
        var queryParameters = GetQueryParameters(request);
        if (!queryParameters.Any())
            return url;

        return url + QueryStringBuilder.Build(queryParameters);
    }

    private static string GetQueryStringWithAdditionalParameters(
        string queryString,
        IEnumerable<KeyValuePair<string, string>>? additionalQueryParameters
    )
    {
        if (additionalQueryParameters is null || !additionalQueryParameters.Any())
        {
            return queryString;
        }

        // Parse existing query string, remove keys that will be overridden, then add additional params
        var existingParams = ParseQueryString(queryString);
        var additionalKeys = new HashSet<string>(
            additionalQueryParameters.Select(p => p.Key).Distinct()
        );
        var filteredParams = existingParams.Where(kv => !additionalKeys.Contains(kv.Key)).ToList();
        filteredParams.AddRange(additionalQueryParameters);
        return QueryStringBuilder.Build(filteredParams);
    }

    private static List<KeyValuePair<string, string>> ParseQueryString(string queryString)
    {
        var result = new List<KeyValuePair<string, string>>();
        if (string.IsNullOrEmpty(queryString))
            return result;

        // Remove leading '?' if present
        var query = queryString.StartsWith("?") ? queryString.Substring(1) : queryString;
        if (string.IsNullOrEmpty(query))
            return result;

        foreach (var pair in query.Split('&'))
        {
            var parts = pair.Split(new[] { '=' }, 2);
            if (parts.Length == 2)
            {
                result.Add(
                    new KeyValuePair<string, string>(
                        Uri.UnescapeDataString(parts[0]),
                        Uri.UnescapeDataString(parts[1])
                    )
                );
            }
            else if (parts.Length == 1 && !string.IsNullOrEmpty(parts[0]))
            {
                result.Add(new KeyValuePair<string, string>(Uri.UnescapeDataString(parts[0]), ""));
            }
        }
        return result;
    }

    private static List<KeyValuePair<string, string>> GetQueryParameters(
        global::SeedApi.Core.BaseRequest request
    )
    {
        var result = TransformToKeyValuePairs(request.Query);
        if (
            request.Options?.AdditionalQueryParameters is null
            || !request.Options.AdditionalQueryParameters.Any()
        )
        {
            return result;
        }

        var additionalKeys = request
            .Options.AdditionalQueryParameters.Select(p => p.Key)
            .Distinct();
        foreach (var key in additionalKeys)
        {
            result.RemoveAll(kv => kv.Key == key);
        }

        result.AddRange(request.Options.AdditionalQueryParameters);
        return result;
    }

    private static List<KeyValuePair<string, string>> TransformToKeyValuePairs(
        Dictionary<string, object> inputDict
    )
    {
        // Use QueryStringConverter.ToExplodedForm to handle nested objects with bracket notation
        // This matches TypeScript SDK behavior: arrays use repeated keys, objects use bracket notation
        return QueryStringConverter.ToExplodedForm(inputDict).ToList();
    }

    private static async SystemTask MergeHeadersAsync(
        Dictionary<string, List<string>> mergedHeaders,
        Headers? headers
    )
    {
        if (headers is null)
        {
            return;
        }

        foreach (var header in headers)
        {
            var value = await header.Value.ResolveAsync().ConfigureAwait(false);
            if (value is not null)
            {
                mergedHeaders[header.Key] = [value];
            }
        }
    }

    private static void MergeAdditionalHeaders(
        Dictionary<string, List<string>> mergedHeaders,
        IEnumerable<KeyValuePair<string, string?>>? headers
    )
    {
        if (headers is null)
        {
            return;
        }

        var usedKeys = new HashSet<string>();
        foreach (var header in headers)
        {
            if (header.Value is null)
            {
                mergedHeaders.Remove(header.Key);
                usedKeys.Remove(header.Key);
                continue;
            }

            if (usedKeys.Contains(header.Key))
            {
                mergedHeaders[header.Key].Add(header.Value);
            }
            else
            {
                mergedHeaders[header.Key] = [header.Value];
                usedKeys.Add(header.Key);
            }
        }
    }

    private void SetHeaders(
        HttpRequestMessage httpRequest,
        Dictionary<string, List<string>> mergedHeaders
    )
    {
        foreach (var kv in mergedHeaders)
        {
            foreach (var header in kv.Value)
            {
                if (header is null)
                {
                    continue;
                }

                httpRequest.Headers.TryAddWithoutValidation(kv.Key, header);
            }
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

    /// <inheritdoc />
    [Obsolete("Use global::SeedApi.Core.ApiResponse instead.")]
    internal record ApiResponse : global::SeedApi.Core.ApiResponse;

    /// <inheritdoc />
    [Obsolete("Use global::SeedApi.Core.BaseRequest instead.")]
    internal abstract record BaseApiRequest : global::SeedApi.Core.BaseRequest;

    /// <inheritdoc />
    [Obsolete("Use global::SeedApi.Core.EmptyRequest instead.")]
    internal abstract record EmptyApiRequest : global::SeedApi.Core.EmptyRequest;

    /// <inheritdoc />
    [Obsolete("Use global::SeedApi.Core.JsonRequest instead.")]
    internal abstract record JsonApiRequest : global::SeedApi.Core.JsonRequest;

    /// <inheritdoc />
    [Obsolete("Use global::SeedApi.Core.MultipartFormRequest instead.")]
    internal abstract record MultipartFormRequest : global::SeedApi.Core.MultipartFormRequest;

    /// <inheritdoc />
    [Obsolete("Use global::SeedApi.Core.StreamRequest instead.")]
    internal abstract record StreamApiRequest : global::SeedApi.Core.StreamRequest;
}
