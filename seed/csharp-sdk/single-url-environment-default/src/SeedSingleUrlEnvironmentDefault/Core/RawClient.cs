using System.Text;
using System.Text.Json;

namespace SeedSingleUrlEnvironmentDefault;

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

  /// <summary>
  /// Base URL for the API.
  /// </summary>
  private readonly string _apiBaseUrl;

  public RawClient(string apiBaseUrl, ClientOptions clientOptions, Dictionary<String, String> headers)
  {
    _clientOptions = clientOptions;
    _headers = headers;
    _apiBaseUrl = apiBaseUrl;
  }

  public async Task<ApiResponse> MakeRequest<T>(HttpMethod method, string path, ApiRequest request)
  {
    var httpRequest = new HttpRequestMessage(method, this.BuildUrl(path, request.Query));
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
      httpRequest.Content = new StringContent(
          JsonSerializer.Serialize(request.Body), Encoding.UTF8, "application/json");
    }
    // Send the request
    HttpResponseMessage response = await _clientOptions.HttpClient.SendAsync(httpRequest);
    return new ApiResponse
    {
      StatusCode = (int)response.StatusCode,
      Body = response
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

    public ClientOptions ClientOptions { get; init; }

    public object RequestOptions { get; init; }
  }

  /// <summary>
  /// The response object returned from the API.
  /// </summary>
  public class ApiResponse
  {
    public int StatusCode;

    public HttpResponseMessage Body;
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