using SeedPackageYml;

#nullable enable

namespace SeedPackageYml;

public class ServiceClient
{
    private RawClient _client;

    public ServiceClient(RawClient client)
    {
        _client = client;
    }

    public async void NopAsync(string id, string nestedId)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest { Method = HttpMethod.Get, Path = $"/{id}//{nestedId}" }
        );
    }
}
