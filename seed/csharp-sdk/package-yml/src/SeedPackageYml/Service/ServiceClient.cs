using System.Net.Http;
using SeedPackageYml.Core;

#nullable enable

namespace SeedPackageYml;

public class ServiceClient
{
    private RawClient _client;

    public ServiceClient(RawClient client)
    {
        _client = client;
    }

    public async Task NopAsync(string id, string nestedId, RequestOptions? options = null)
    {
        await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Get,
                Path = $"/{id}//{nestedId}",
                Options = options
            }
        );
    }
}
