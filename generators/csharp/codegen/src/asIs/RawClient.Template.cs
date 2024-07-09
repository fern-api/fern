using System.Text;
using System.Text.Json;
using System.Net.Http;

namespace <%= namespace%>;

#nullable enable

/// <summary>
/// Utility class for making raw HTTP requests to the API.
/// </summary>
public class RawClient(Dictionary<string, string> headers, ClientOptions clientOptions)
{
    /// <summary>
    /// The http client used to make requests.
    /// </summary>
    private readonly ClientOptions _clientOptions = clientOptions;

    /// <summary>
    /// Global headers to be sent with every request.
    /// </summary>
    private readonly Dictionary<string, string> _headers = headers;

    public async Task<ApiResponse> MakeRequestAsync(BaseApiRequest request)
    {
        var url = BuildUrl(request.Path, request.Query);
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
                var serializerOptions = new JsonSerializerOptions { WriteIndented = true, };
                httpRequest.Content = new StringContent(
                    JsonSerializer.Serialize(jsonRequest.Body, serializerOptions),
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
        var response = await _clientOptions.HttpClient.SendAsync(httpRequest);
        return new ApiResponse { StatusCode = (int)response.StatusCode, Raw = response };
    }

    public abstract class BaseApiRequest
    {
        public required HttpMethod Method;

        public required string Path;

        public readonly string? ContentType = null;

        public Dictionary<string, object> Query { get; } = new();

        public Dictionary<string, string> Headers { get; } = new();

        public object? RequestOptions { get; init; }
    }

    /// <summary>
    /// The request object to be sent for streaming uploads.
    /// </summary>
    public abstract class StreamApiRequest : BaseApiRequest
    {
        public Stream? Body => null;
    }

    /// <summary>
    /// The request object to be sent for JSON APIs.
    /// </summary>
    public class JsonApiRequest : BaseApiRequest
    {
        public object? Body { get; init; }
    }

    /// <summary>
    /// The response object returned from the API.
    /// </summary>
    public class ApiResponse
    {
        public int StatusCode;

        public required HttpResponseMessage Raw;
    }

    private string BuildUrl(string path, Dictionary<string, object> query)
    {
        var trimmedBaseUrl = _clientOptions.BaseUrl.TrimEnd('/');
        var trimmedBasePath = path.TrimStart('/');
        var url = $"{trimmedBaseUrl}/{trimmedBasePath}";
        if (query.Count <= 0) return url;
        url += "?";
        url = query.Aggregate(url, (current, queryItem) => current + $"{queryItem.Key}={queryItem.Value}&");
        url = url.Substring(0, url.Length - 1);
        return url;
    }
}