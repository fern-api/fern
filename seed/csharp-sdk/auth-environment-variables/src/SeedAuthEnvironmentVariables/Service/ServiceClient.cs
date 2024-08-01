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
    public async Task<string> GetWithApiKeyAsync(RequestOptions? options = null)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Get,
                Path = "apiKey",
                Options = options
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            try
            {
                return JsonUtils.Deserialize<string>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedAuthEnvironmentVariablesException(
                    "Failed to deserialize response",
                    e
                );
            }
        }

        throw new SeedAuthEnvironmentVariablesApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            JsonUtils.Deserialize<object>(responseBody)
        );
    }

    /// <summary>
    /// GET request with custom api key
    /// </summary>
    public async Task<string> GetWithHeaderAsync(
        HeaderAuthRequest request,
        RequestOptions? options = null
    )
    {
        var _headers = new Dictionary<string, string>()
        {
            { "X-Endpoint-Header", request.XEndpointHeader },
        };
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Get,
                Path = "apiKeyInHeader",
                Headers = _headers,
                Options = options
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            try
            {
                return JsonUtils.Deserialize<string>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedAuthEnvironmentVariablesException(
                    "Failed to deserialize response",
                    e
                );
            }
        }

        throw new SeedAuthEnvironmentVariablesApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            JsonUtils.Deserialize<object>(responseBody)
        );
    }
}
