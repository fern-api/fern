using System.Net.Http;
using SeedVariables.Core;

#nullable enable

namespace SeedVariables;

public class ServiceClient
{
    private RawClient _client;

    public ServiceClient(RawClient client)
    {
        _client = client;
    }

    public async Task PostAsync(string endpointParam)
    {
        await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest { Method = HttpMethod.Post, Path = $"/{endpointParam}" }
        );
    }
}
