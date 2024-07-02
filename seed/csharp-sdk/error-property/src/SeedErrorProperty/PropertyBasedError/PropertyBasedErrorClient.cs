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
    public async Task<string> ThrowErrorAsync()
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest { Method = HttpMethod.Get, Path = "property-based-error" }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<string>(responseBody);
        }
        throw new Exception(responseBody);
    }
}
