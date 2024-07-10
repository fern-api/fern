using System.Net.Http;
using System.Text.Json;
using SeedAuthEnvironmentVariables;
using SeedAuthEnvironmentVariables.Core;

#nullable enable

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
            new RawClient.JsonApiRequest { Method = HttpMethod.Get, Path = "apiKey" }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonSerializer.Deserialize<string>(responseBody)!;
        }
        throw new Exception(responseBody);
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
            new RawClient.JsonApiRequest
            {
                Method = HttpMethod.Get,
                Path = "apiKeyInHeader",
                Headers = _headers
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonSerializer.Deserialize<string>(responseBody)!;
        }
        throw new Exception(responseBody);
    }
}
