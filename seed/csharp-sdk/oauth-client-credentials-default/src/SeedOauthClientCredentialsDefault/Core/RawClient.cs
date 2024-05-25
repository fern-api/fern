using System.Text;
using System.Text.Json;

namespace SeedOauthClientCredentialsDefault;

#nullable enable

/// <summary>
/// Utility class for making raw HTTP requests to the API.
/// </summary>
public class RawClient
{
    /// <summary>
    /// The http client used to make requests.
    /// </summary>
    private readonly ClientOptions _clientOptions;

    /// <summary>
    /// Global headers to be sent with every request.
    /// </summary>
    private readonly Dictionary<String, String> _headers;

    public RawClient(Dictionary<String, String> headers, ClientOptions clientOptions)
    {
        _clientOptions = clientOptions;
        _headers = headers;
    }

    public async Task<ApiResponse> MakeRequestAsync(ApiRequest request)
    {
        var httpRequest = new HttpRequestMessage(
            request.Method,
            this.BuildUrl(request.Path, request.Query)
        );
        if (request.ContentType != null)
        {
            request.Headers.Add("Content-Type", request.ContentType);
        }
        // Add global headers to the request
        foreach (var (key, value) in _headers)
        {
            httpRequest.Headers.Add(key, value);
        }
        // Add request headers to the request
        foreach (var (key, value) in request.Headers)
        {
            httpRequest.Headers.Add(key, value);
        }
        // Add the request body to the request
        if (request.Body != null)
        {
            var serializerOptions = new JsonSerializerOptions
            {
                Converters = { new JsonEnumMemberStringEnumConverter() },
                // Set other options as required:
                WriteIndented = true,
            };
            httpRequest.Content = new StringContent(
                JsonSerializer.Serialize(request.Body, serializerOptions),
                Encoding.UTF8,
                "application/json"
            );
        }
        // Send the request
        HttpResponseMessage response = await _clientOptions.HttpClient.SendAsync(httpRequest);
        return new ApiResponse { StatusCode = (int)response.StatusCode, Raw = response };
    }

    /// <summary>
    /// The request object to be sent to the API.
    /// </summary>
    public class ApiRequest
    {
        public HttpMethod Method;

        public string Path;

        public string? ContentType = null;

        public object? Body { get; init; } = null;

        public Dictionary<string, object> Query { get; init; } = new();

        public Dictionary<string, string> Headers { get; init; } = new();

        public object RequestOptions { get; init; }
    }

    /// <summary>
    /// The response object returned from the API.
    /// </summary>
    public class ApiResponse
    {
        public int StatusCode;

        public HttpResponseMessage Raw;
    }

    private Dictionary<string, string> GetHeaders(ApiRequest request)
    {
        var headers = new Dictionary<string, string>();
        foreach (var (key, value) in request.Headers)
        {
            headers.Add(key, value);
        }
        foreach (var (key, value) in _headers)
        {
            headers.Add(key, value);
        }
        return headers;
    }

    private string BuildUrl(string path, Dictionary<string, object> query)
    {
        var url = $"{_clientOptions.BaseUrl}{path}";
        if (query.Count > 0)
        {
            url += "?";
            foreach (var (key, value) in query)
            {
                url += $"{key}={value}&";
            }
            url = url.Substring(0, url.Length - 1);
        }
        return url;
    }
}
