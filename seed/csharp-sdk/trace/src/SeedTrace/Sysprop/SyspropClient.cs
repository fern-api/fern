using System.Text.Json;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public class SyspropClient
{
    private RawClient _client;

    public SyspropClient(RawClient client)
    {
        _client = client;
    }

    public async void SetNumWarmInstancesAsync(Language language, int numWarmInstances)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                Method = HttpMethod.Put,
                Path = $"/sysprop/num-warm-instances/{language}/{numWarmInstances}"
            }
        );
    }

    public async Task<Dictionary<Language, int>> GetNumWarmInstancesAsync()
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                Method = HttpMethod.Get,
                Path = "/sysprop/num-warm-instances"
            }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<Dictionary<Language, int>>(responseBody);
        }
        throw new Exception(responseBody);
    }
}
