using System.Net.Http;
using System.Text;

namespace SeedExhaustive.Core;

#nullable enable

/// <summary>
/// Utility class for making raw HTTP requests to the API.
/// </summary>
public class RawClient(
    Dictionary<string, string> headers,
    Dictionary<string, Func<string>> headerSuppliers,
    ClientOptions clientOptions
)
{
    /// <summary>
    /// The http client used to make requests.
    /// </summary>
    public readonly ClientOptions Options = clientOptions;

    /// <summary>
    /// Global headers to be sent with every request.
    /// </summary>
    private readonly Dictionary<string, string> _headers = headers;

    public async Task<ApiResponse> MakeRequestAsync(BaseApiRequest request)
    {
        var url = BuildUrl(request);
        var httpRequest = new HttpRequestMessage(request.Method, url);
        if (request.ContentType != null)
        {
            request.Headers.Add("Content-Type", request.ContentType);
        }
        // Add global headers to the request
        foreach (var header in _headers)
        {
            httpRequest.Headers.Add(header.Key, header.Value);
        }
        // Add global headers to the request from supplier
        foreach (var header in headerSuppliers)
        {
            httpRequest.Headers.Add(header.Key, header.Value.Invoke());
        }
        // Add request headers to the request
        foreach (var header in request.Headers)
        {
            httpRequest.Headers.Add(header.Key, header.Value);
        }
        // Add the request body to the request
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
        // Send the request
        var response = await Options.HttpClient.SendAsync(httpRequest);
        return new ApiResponse { StatusCode = (int)response.StatusCode, Raw = response };
    }

    public record BaseApiRequest
    {
        public required string BaseUrl { get; init; }

        public required HttpMethod Method { get; init; }

        public required string Path { get; init; }

        public string? ContentType { get; init; }

        public Dictionary<string, object> Query { get; init; } = new();

        public Dictionary<string, string> Headers { get; init; } = new();

        public object? RequestOptions { get; init; }
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

    private string BuildUrl(BaseApiRequest request)
    {
        var trimmedBaseUrl = request.BaseUrl.TrimEnd('/');
        var trimmedBasePath = request.Path.TrimStart('/');
        var url = $"{trimmedBaseUrl}/{trimmedBasePath}";
        if (request.Query.Count <= 0)
            return url;
        url += "?";
        url = request.Query.Aggregate(
            url,
            (current, queryItem) => current + $"{queryItem.Key}={queryItem.Value}&"
        );
        url = url.Substring(0, url.Length - 1);
        return url;
    }
}
