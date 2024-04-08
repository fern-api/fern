using System.Net;
using System.Text.Json;

namespace SeedApi;

/// <summary>
/// Utility class for making raw HTTP requests to the AssemblyAI API.
/// </summary>
public class RawAssemblyAIClient
{
    /// <summary>
    /// The http client used to make requests.
    /// </summary>
    private ClientOptions _clientOptions;
    
    /// <summary>
    /// Global headers to be sent with every request.
    /// </summary>
    private Dictionary<String, String> _headers;
    
    /// <summary>
    /// Base URL for the API.
    /// </summary>
    private string _apiBaseUrl;
    
    public RawAssemblyAIClient(string apiBaseUrl, ClientOptions clientOptions, Dictionary<String, String> headers)
    {
        _clientOptions = clientOptions;
        _headers = headers;
        _apiBaseUrl = apiBaseUrl;
    }
    
    public async Task<APIResponse<T>> MakeRequest<T>(HttpMethod method, string path, ApiRequest request)
    {
        var httpRequest = new HttpRequestMessage(method, this.BuildUrl(path, request.Query));
        if (request.ContentType != null)
        {
            request.Headers.Add("Content-Type", request.ContentType);
        }
        foreach (var (key, value) in request.Headers)
        {
            httpRequest.Headers.Add(key, value);
        }
        var response = await _clientOptions.HttpClient.SendAsync(httpRequest);
        var responseBody = await response.Content.ReadAsStringAsync();
        var responseObject = JsonSerializer.Deserialize<T>(responseBody);
        return new APIResponse<T>
        {
            StatusCode = response.StatusCode,
            ContentType = response.Content.Headers.ContentType?.MediaType,
            Body = responseObject
        };
    }
    
    /// <summary>
    /// The request object to be sent to the API.
    /// </summary>
    public class ApiRequest
    {
        public string? ContentType = null;
        
        public object? Body { get; init; } = null;

        public Dictionary<string, object> Query { get; init; } = new();
        
        public Dictionary<string, string> Headers { get; init; } = new();
        
        public object ClientOptions { get; init; }
        
        public object RequestOptions { get; init; }
    }
    
    /// <summary>
    /// The response object returned from the API.
    /// </summary>
    public class APIResponse<T>
    {
        public HttpStatusCode? StatusCode;

        public string? ContentType = null;

        public T Body;
    }
    
    private string BuildUrl(string path, Dictionary<string, object> query)
    {
        var url = $"{_apiBaseUrl}/{path}";
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