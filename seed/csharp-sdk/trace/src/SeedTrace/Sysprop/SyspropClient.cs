using System.Text.Json;
using SeedTrace;

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
            new RawClient.ApiRequest
            {
                Method = HttpMethod.Put,
                Path = "/num-warm-instances//language//numWarmInstances"
            }
        );
    }

    public async List<Dictionary<Language, int>> GetNumWarmInstancesAsync()
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest { Method = HttpMethod.Get, Path = "/num-warm-instances" }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (responseBody.StatusCode >= 200 && responseBody.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<List<Dictionary<Language, int>>>(responseBody);
        }
        throw new Exception();
    }
}
