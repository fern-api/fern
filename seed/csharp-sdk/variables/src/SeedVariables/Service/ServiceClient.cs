using SeedVariables;

#nullable enable

namespace SeedVariables;

public class ServiceClient
{
    private RawClient _client;

    public ServiceClient(RawClient client)
    {
        _client = client;
    }

    public async void PostAsync(string endpointParam)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest { Method = HttpMethod.Post, Path = $"/{endpointParam}" }
        );
    }
}
