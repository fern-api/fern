using System.Net.Http;
using System.Text.Json;
using SeedErrorProperty.Core;

#nullable enable

namespace SeedErrorProperty;

public class PropertyBasedErrorClient
{
    private RawClient _client;

    public PropertyBasedErrorClient(RawClient client)
    {
        _client = client;
    }

    /// <summary>
    /// GET request that always throws an error
    /// </summary>
    public async Task<string> ThrowErrorAsync(RequestOptions? options = null)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Get,
                Path = "property-based-error",
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
                throw new SeedErrorPropertyException("Failed to deserialize response", e);
            }
        }

        throw new SeedErrorPropertyApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            JsonUtils.Deserialize<object>(responseBody)
        );
    }
}
