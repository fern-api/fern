using System.Net.Http;
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
    public async Task<string> ThrowErrorAsync()
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseURL = _client.Options.BaseURL,
                Method = HttpMethod.Get,
                Path = "property-based-error"
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonUtils.Deserialize<string>(responseBody)!;
        }
        throw new Exception(responseBody);
    }
}
