using System.Text.Json;
using SeedAuthEnvironmentVariables;

namespace SeedAuthEnvironmentVariables;

public class ServiceClient
{
    private RawClient _client;

    public ServiceClient(RawClient client)
    {
        _client = client;
    }

    /// <summary>
    /// GET request with custom api key
    /// </summary>
    public async Task<string> GetWithApiKeyAsync()
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest { Method = HttpMethod.Get, Path = "/apiKey" }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<string>(responseBody);
        }
        throw new Exception();
    }

    /// <summary>
    /// GET request with custom api key
    /// </summary>
    public async Task<string> GetWithHeaderAsync(HeaderAuthRequest request)
    {
        var _headers = new Dictionary<string, string>()
        {
            { "X-Endpoint-Header", request.XEndpointHeader },
        };
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest
            {
                Method = HttpMethod.Get,
                Path = "/apiKeyInHeader",
                Headers = _headers
            }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<string>(responseBody);
        }
        throw new Exception();
    }
}
