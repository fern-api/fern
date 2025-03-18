using global::System.Net.Http;
using global::System.Net.Http.Headers;
using global::System.Text;
using SystemTask = global::System.Threading.Tasks.Task;

namespace SeedOauthClientCredentialsEnvironmentVariables.Core;

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
                        .Value?.Trim('"') ?? Guid.NewGuid().ToString("N");
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

    internal abstract record BaseApiRequest
    {
        internal required string BaseUrl { get; init; }

        internal required HttpMethod Method { get; init; }

        internal required string Path { get; init; }

        internal string? ContentType { get; init; }

        internal Dictionary<string, object> Query { get; init; } = new();

        internal Headers Headers { get; init; } = new();

        internal IRequestOptions? Options { get; init; }

        internal abstract HttpContent? CreateContent();
    }

    /// <summary>
    /// The request object to send without a request body.
    /// </summary>
    internal record EmptyApiRequest : BaseApiRequest
    {
        internal override HttpContent? CreateContent() => null;
    }

    /// <summary>
    /// The request object to be sent for streaming uploads.
    /// </summary>
    internal record StreamApiRequest : BaseApiRequest
    {
        internal Stream? Body { get; init; }

        internal override HttpContent? CreateContent()
        {
            if (Body is null)
            {
                return null;
            }

            var content = new StreamContent(Body)
            {
                Headers =
                {
                    ContentType = MediaTypeHeaderValue.Parse(
                        ContentType ?? "application/octet-stream"
                    ),
                },
            };
            return content;
        }
    }

    /// <summary>
    /// The request object to be sent for multipart form data.
    /// </summary>
    internal record MultipartFormRequest : BaseApiRequest
    {
        private readonly List<Action<MultipartFormDataContent>> _partAdders = [];

        internal void AddJsonPart(string name, object? value) => AddJsonPart(name, value, null);

        internal void AddJsonPart(string name, object? value, string? contentType)
        {
            if (value is null)
            {
                return;
            }

            _partAdders.Add(form =>
            {
                var (encoding, mediaType) = ParseContentTypeOrDefault(
                    contentType,
                    Encoding.UTF8,
                    "application/json"
                );
                var content = new StringContent(JsonUtils.Serialize(value), encoding, mediaType);
                form.Add(content, name);
            });
        }

        internal void AddJsonParts(string name, IEnumerable<object?>? value) =>
            AddJsonParts(name, value, null);

        internal void AddJsonParts(string name, IEnumerable<object?>? value, string? contentType)
        {
            if (value is null)
            {
                return;
            }

            foreach (var item in value)
            {
                AddJsonPart(name, item, contentType);
            }
        }

        internal void AddStringPart(string name, object? value) => AddStringPart(name, value, null);

        internal void AddStringPart(string name, object? value, string? contentType)
        {
            if (value is null)
            {
                return;
            }

            AddStringPart(name, ValueConvert.ToString(value), contentType);
        }

        internal void AddStringPart(string name, string? value) => AddStringPart(name, value, null);

        internal void AddStringPart(string name, string? value, string? contentType)
        {
            if (value is null)
            {
                return;
            }

            _partAdders.Add(form =>
            {
                var (encoding, mediaType) = ParseContentTypeOrDefault(
                    contentType,
                    Encoding.UTF8,
                    "text/plain"
                );
                var content = new StringContent(value, encoding, mediaType);
                form.Add(content, name);
            });
        }

        internal void AddStringParts(string name, IEnumerable<object?>? value) =>
            AddStringParts(name, value, null);

        internal void AddStringParts(string name, IEnumerable<object?>? value, string? contentType)
        {
            if (value is null)
            {
                return;
            }

            AddStringPart(name, ValueConvert.ToString(value), contentType);
        }

        internal void AddStringParts(string name, IEnumerable<string?>? value) =>
            AddStringParts(name, value, null);

        internal void AddStringParts(string name, IEnumerable<string?>? value, string? contentType)
        {
            if (value is null)
            {
                return;
            }

            foreach (var item in value)
            {
                AddStringPart(name, item, contentType);
            }
        }

        internal void AddStreamPart(string name, Stream? stream, string? fileName) =>
            AddStreamPart(name, stream, fileName, null);

        internal void AddStreamPart(
            string name,
            Stream? stream,
            string? fileName,
            string? contentType
        )
        {
            if (stream is null)
            {
                return;
            }

            _partAdders.Add(form =>
            {
                var content = new StreamContent(stream)
                {
                    Headers =
                    {
                        ContentType = MediaTypeHeaderValue.Parse(
                            contentType ?? "application/octet-stream"
                        ),
                    },
                };

                if (fileName is not null)
                {
                    form.Add(content, name, fileName);
                }
                else
                {
                    form.Add(content, name);
                }
            });
        }

        internal void AddFileParameterPart(string name, FileParameter? file) =>
            AddFileParameterPart(name, file, null);

        internal void AddFileParameterPart(
            string name,
            FileParameter? file,
            string? fallbackContentType
        ) =>
            AddStreamPart(
                name,
                file?.Stream,
                file?.FileName,
                file?.ContentType ?? fallbackContentType
            );

        internal void AddFileParameterParts(string name, IEnumerable<FileParameter?>? files) =>
            AddFileParameterParts(name, files, null);

        internal void AddFileParameterParts(
            string name,
            IEnumerable<FileParameter?>? files,
            string? fallbackContentType
        )
        {
            if (files is null)
            {
                return;
            }

            foreach (var file in files)
            {
                AddFileParameterPart(name, file, fallbackContentType);
            }
        }

        internal void AddFormEncodedPart(string name, object? value) =>
            AddFormEncodedPart(name, value, null);

        internal void AddFormEncodedPart(string name, object? value, string? contentType)
        {
            if (value is null)
            {
                return;
            }

            _partAdders.Add(form =>
            {
                var content = FormUrlEncoder.EncodeAsForm(value);
                if (!string.IsNullOrEmpty(contentType))
                {
                    content.Headers.ContentType = MediaTypeHeaderValue.Parse(contentType);
                }

                form.Add(content, name);
            });
        }

        internal void AddFormEncodedParts(string name, IEnumerable<object?>? value) =>
            AddFormEncodedParts(name, value, null);

        internal void AddFormEncodedParts(
            string name,
            IEnumerable<object?>? value,
            string? contentType
        )
        {
            if (value is null)
            {
                return;
            }

            foreach (var item in value)
            {
                AddFormEncodedPart(name, item, contentType);
            }
        }

        internal void AddExplodedFormEncodedPart(string name, object? value) =>
            AddExplodedFormEncodedPart(name, value, null);

        internal void AddExplodedFormEncodedPart(string name, object? value, string? contentType)
        {
            if (value is null)
            {
                return;
            }

            _partAdders.Add(form =>
            {
                var content = FormUrlEncoder.EncodeAsExplodedForm(value);
                if (!string.IsNullOrEmpty(contentType))
                {
                    content.Headers.ContentType = MediaTypeHeaderValue.Parse(contentType);
                }

                form.Add(content, name);
            });
        }

        internal void AddExplodedFormEncodedParts(string name, IEnumerable<object?>? value) =>
            AddExplodedFormEncodedParts(name, value, null);

        internal void AddExplodedFormEncodedParts(
            string name,
            IEnumerable<object?>? value,
            string? contentType
        )
        {
            if (value is null)
            {
                return;
            }

            foreach (var item in value)
            {
                AddExplodedFormEncodedPart(name, item, contentType);
            }
        }

        internal override HttpContent CreateContent()
        {
            var form = new MultipartFormDataContent();
            foreach (var adder in _partAdders)
            {
                adder(form);
            }

            return form;
        }
    }

    /// <summary>
    /// The request object to be sent for JSON APIs.
    /// </summary>
    internal record JsonApiRequest : BaseApiRequest
    {
        internal object? Body { get; init; }

        internal override HttpContent? CreateContent()
        {
            if (Body is null && Options?.AdditionalBodyProperties is null)
            {
                return null;
            }

            var (encoding, mediaType) = ParseContentTypeOrDefault(
                ContentType,
                Encoding.UTF8,
                "application/json"
            );
            return new StringContent(
                JsonUtils.SerializeWithAdditionalProperties(
                    Body,
                    Options?.AdditionalBodyProperties
                ),
                encoding,
                mediaType
            );
        }
    }

    /// <summary>
    /// The response object returned from the API.
    /// </summary>
    internal record ApiResponse
    {
        internal required int StatusCode { get; init; }

        internal required HttpResponseMessage Raw { get; init; }
    }

    /// <summary>
    /// Sends the request with retries, unless the request content is not retryable,
    /// such as stream requests and multipart form data with stream content.
    /// </summary>
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
            using var retryRequest = await CloneRequestAsync(request).ConfigureAwait(false);
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
            StreamContent => false,
            MultipartContent content => !content.Any(c => c is StreamContent),
            _ => true,
        };
    }

    internal HttpRequestMessage CreateHttpRequest(BaseApiRequest request)
    {
        var url = BuildUrl(request);
        var httpRequest = new HttpRequestMessage(request.Method, url);
        httpRequest.Content = request.CreateContent();
        var mergedHeaders = new Dictionary<string, List<string>>();
        MergeHeaders(mergedHeaders, Options.Headers);
        MergeAdditionalHeaders(mergedHeaders, Options.AdditionalHeaders);
        MergeHeaders(mergedHeaders, request.Headers);
        MergeHeaders(mergedHeaders, request.Options?.Headers ?? new Headers());

        MergeAdditionalHeaders(mergedHeaders, request.Options?.AdditionalHeaders ?? []);
        SetHeaders(httpRequest, mergedHeaders);
        return httpRequest;
    }

    private static string BuildUrl(BaseApiRequest request)
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

    private static List<KeyValuePair<string, string>> GetQueryParameters(BaseApiRequest request)
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
        Headers headers
    )
    {
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
        IEnumerable<KeyValuePair<string, string?>> headers
    )
    {
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

    private static (Encoding encoding, string mediaType) ParseContentTypeOrDefault(
        string? contentType,
        Encoding encodingFallback,
        string mediaTypeFallback
    )
    {
        var encoding = encodingFallback;
        var mediaType = mediaTypeFallback;
        if (string.IsNullOrEmpty(contentType))
        {
            return (encoding, mediaType);
        }

        var mediaTypeHeaderValue = MediaTypeHeaderValue.Parse(contentType);
        if (!string.IsNullOrEmpty(mediaTypeHeaderValue.CharSet))
        {
            encoding = Encoding.GetEncoding(mediaTypeHeaderValue.CharSet);
        }

        if (!string.IsNullOrEmpty(mediaTypeHeaderValue.MediaType))
        {
            mediaType = mediaTypeHeaderValue.MediaType;
        }

        return (encoding, mediaType);
    }
}
