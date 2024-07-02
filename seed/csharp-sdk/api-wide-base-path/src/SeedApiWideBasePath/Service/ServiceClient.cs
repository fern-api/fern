using SeedApiWideBasePath;

#nullable enable

namespace SeedApiWideBasePath;

public class ServiceClient
{
    private RawClient _client;

    public ServiceClient(RawClient client)
    {
        _client = client;
    }

    public async void PostAsync(
        string pathParam,
        string serviceParam,
        string resourceParam,
        int endpointParam
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                Method = HttpMethod.Post,
                Path = $"/test/{pathParam}/{serviceParam}/{endpointParam}/{resourceParam}"
            }
        );
    }
}
