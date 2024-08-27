using System.Net.Http;
using System.Text;
using System.Threading;

namespace SeedAliasExtends.Core;

#nullable enable

/// <summary>
/// Utility class for making raw HTTP requests to the API.
/// </summary>
internal class RawClient(ClientOptions clientOptions)
{
    /// <summary>
    /// The http client used to make requests.
    /// </summary>
    public readonly ClientOptions Options = clientOptions;

    public async Task<ApiResponse> MakeRequestAsync(
        BaseApiRequest request,
        CancellationToken cancellationToken = default
    )
    {
        var url = BuildUrl(request);
        var httpRequest = new HttpRequestMessage(request.Method, url);
        if (request.ContentType != null)
        {
            request.Headers.Add("Content-Type", request.ContentType);
        }
        SetHeaders(httpRequest, Options.Headers);
        SetHeaders(httpRequest, request.Headers);
        SetHeaders(httpRequest, request.Options?.Headers ?? new());

        // Add the request body to the request.
        if (request is JsonApiRequest jsonRequest)
        {
            if (jsonRequest.Body != null)
            {
                httpRequest.Content = new StringContent(
                    JsonUtils.Serialize(jsonRequest.Body),
                    Encoding.UTF8,
                    "application/json"
                );
            }
        }
        else if (request is StreamApiRequest { Body: not null } streamRequest)
        {
            httpRequest.Content = new StreamContent(streamRequest.Body);
        }

        // Apply the request timeout, if any.
        var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        var timeout = request.Options?.Timeout ?? Options.Timeout;
        if (timeout != null)
        {
            cts.CancelAfter(timeout);
        }

        // Send the request.
        var httpClient = request.Options?.HttpClient ?? Options.HttpClient;
        var response = await httpClient.SendAsync(httpRequest, cts.Token);
        return new ApiResponse { StatusCode = (int)response.StatusCode, Raw = response };
    }

    public record BaseApiRequest
    {
        public required string BaseUrl { get; init; }

        public required HttpMethod Method { get; init; }

        public required string Path { get; init; }

        public string? ContentType { get; init; }

        public Dictionary<string, object> Query { get; init; } = new();

        public Headers Headers { get; init; } = new();

        public RequestOptions? Options { get; init; }
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

    private void SetHeaders(HttpRequestMessage httpRequest, Headers headers)
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

    private string BuildUrl(BaseApiRequest request)
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
        url = url.Substring(0, url.Length - 1);
        return url;
    }
}
