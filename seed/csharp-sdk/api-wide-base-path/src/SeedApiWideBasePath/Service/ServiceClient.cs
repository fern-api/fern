using System.Net.Http;
using SeedApiWideBasePath.Core;

#nullable enable

namespace SeedApiWideBasePath;

public class ServiceClient
{
    private RawClient _client;

    public ServiceClient(RawClient client)
    {
        _client = client;
    }

    public async Task PostAsync(
        string pathParam,
        string serviceParam,
        string resourceParam,
        int endpointParam
    )
    {
        await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseURL = _client.Options.BaseURL,
                Method = HttpMethod.Post,
                Path = $"/test/{pathParam}/{serviceParam}/{endpointParam}/{resourceParam}"
            }
        );
    }
}
