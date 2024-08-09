using System.Net.Http;
using System.Text.Json;
using SeedBearerTokenEnvironmentVariable.Core;

#nullable enable

namespace SeedBearerTokenEnvironmentVariable;

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
    public async Task<string> GetWithBearerTokenAsync(RequestOptions? options = null)
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
                throw new SeedBearerTokenEnvironmentVariableException(
                    "Failed to deserialize response",
                    e
                );
            }
        }

        throw new SeedBearerTokenEnvironmentVariableApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            JsonUtils.Deserialize<object>(responseBody)
        );
    }
}
