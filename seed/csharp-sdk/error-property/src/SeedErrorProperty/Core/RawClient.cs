using global::System.Net.Http;
using global::System.Net.Http.Headers;
using global::System.Text;
using SystemTask = global::System.Threading.Tasks.Task;

namespace SeedErrorProperty.Core;

/// <summary>
/// Utility class for making raw HTTP requests to the API.
/// </summary>
internal partial class RawClient(ClientOptions clientOptions)
{
    private const int MaxRetryDelayMs = 60000;
    internal int BaseRetryDelay { get; set; } = 1000;

    /// <summary>
    /// The client options applied on every request.
    /// </summary>
    internal readonly ClientOptions Options = clientOptions;

    [Obsolete("Use SendRequestAsync instead.")]
    internal Task<global::SeedErrorProperty.Core.ApiResponse> MakeRequestAsync(
        global::SeedErrorProperty.Core.BaseRequest request,
        CancellationToken cancellationToken = default
    )
    {
        return SendRequestAsync(request, cancellationToken);
    }

    internal async Task<global::SeedErrorProperty.Core.ApiResponse> SendRequestAsync(
        global::SeedErrorProperty.Core.BaseRequest request,
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

    internal async Task<global::SeedErrorProperty.Core.ApiResponse> SendRequestAsync(
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

    private static async Task<HttpRequestMessage> CloneRequestAsync(HttpRequestMessage request)
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
    private async Task<global::SeedErrorProperty.Core.ApiResponse> SendWithRetriesAsync(
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
            return new global::SeedErrorProperty.Core.ApiResponse
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

            var delayMs = Math.Min(BaseRetryDelay * (int)Math.Pow(2, i), MaxRetryDelayMs);
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

        return new global::SeedErrorProperty.Core.ApiResponse
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

    internal HttpRequestMessage CreateHttpRequest(
        global::SeedErrorProperty.Core.BaseRequest request
    )
    {
        var url = BuildUrl(request);
        var httpRequest = new HttpRequestMessage(request.Method, url);
        httpRequest.Content = request.CreateContent();
        var mergedHeaders = new Dictionary<string, List<string>>();
        MergeHeaders(mergedHeaders, Options.Headers);
        MergeAdditionalHeaders(mergedHeaders, Options.AdditionalHeaders);
        MergeHeaders(mergedHeaders, request.Headers);
        MergeHeaders(mergedHeaders, request.Options?.Headers);

        MergeAdditionalHeaders(mergedHeaders, request.Options?.AdditionalHeaders ?? []);
        SetHeaders(httpRequest, mergedHeaders);
        return httpRequest;
    }

    private static string BuildUrl(global::SeedErrorProperty.Core.BaseRequest request)
    {
        var baseUrl = request.Options?.BaseUrl ?? request.BaseUrl;
        var trimmedBaseUrl = baseUrl.TrimEnd('/');
        var trimmedBasePath = request.Path.TrimStart('/');
        var url = $"{trimmedBaseUrl}/{trimmedBasePath}";

        var queryParameters = GetQueryParameters(request);
        if (!queryParameters.Any())
            return url;

        url += "?";
        url = queryParameters.Aggregate(
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
                        .Select(value =>
                            $"{Uri.EscapeDataString(queryItem.Key)}={Uri.EscapeDataString(value?.ToString() ?? "")}"
                        )
                        .ToList();
                    if (items.Any())
                    {
                        current += string.Join("&", items) + "&";
                    }
                }
                else
                {
                    current +=
                        $"{Uri.EscapeDataString(queryItem.Key)}={Uri.EscapeDataString(queryItem.Value)}&";
                }

                return current;
            }
        );
        url = url[..^1];
        return url;
    }

    private static List<KeyValuePair<string, string>> GetQueryParameters(
        global::SeedErrorProperty.Core.BaseRequest request
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
        var result = new List<KeyValuePair<string, string>>();
        foreach (var kvp in inputDict)
        {
            switch (kvp.Value)
            {
                case string str:
                    result.Add(new KeyValuePair<string, string>(kvp.Key, str));
                    break;
                case IEnumerable<string> strList:
                {
                    foreach (var value in strList)
                    {
                        result.Add(new KeyValuePair<string, string>(kvp.Key, value));
                    }

                    break;
                }
            }
        }

        return result;
    }

    private static void MergeHeaders(
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
            var value = header.Value?.Match(str => str, func => func.Invoke());
            if (value != null)
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
    [Obsolete("Use global::SeedErrorProperty.Core.ApiResponse instead.")]
    internal record ApiResponse : global::SeedErrorProperty.Core.ApiResponse;

    /// <inheritdoc />
    [Obsolete("Use global::SeedErrorProperty.Core.BaseRequest instead.")]
    internal abstract record BaseApiRequest : global::SeedErrorProperty.Core.BaseRequest;

    /// <inheritdoc />
    [Obsolete("Use global::SeedErrorProperty.Core.EmptyRequest instead.")]
    internal abstract record EmptyApiRequest : global::SeedErrorProperty.Core.EmptyRequest;

    /// <inheritdoc />
    [Obsolete("Use global::SeedErrorProperty.Core.JsonRequest instead.")]
    internal abstract record JsonApiRequest : global::SeedErrorProperty.Core.JsonRequest;

    /// <inheritdoc />
    [Obsolete("Use global::SeedErrorProperty.Core.MultipartFormRequest instead.")]
    internal abstract record MultipartFormRequest
        : global::SeedErrorProperty.Core.MultipartFormRequest;

    /// <inheritdoc />
    [Obsolete("Use global::SeedErrorProperty.Core.StreamRequest instead.")]
    internal abstract record StreamApiRequest : global::SeedErrorProperty.Core.StreamRequest;
}
