using System.Net.Http;
using SeedTrace;
using SeedTrace.Core;

#nullable enable

namespace SeedTrace;

public class SyspropClient
{
    private RawClient _client;

    public SyspropClient(RawClient client)
    {
        _client = client;
    }

    public async Task SetNumWarmInstancesAsync(Language language, int numWarmInstances)
    {
        await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
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
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Get,
                Path = "/sysprop/num-warm-instances"
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonUtils.Deserialize<Dictionary<Language, int>>(responseBody)!;
        }
        throw new Exception(responseBody);
    }
}
