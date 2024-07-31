using System.Net.Http;
using SeedApi.Core;
using SeedApi.Folder;

#nullable enable

namespace SeedApi.Folder;

public class FolderClient
{
    private RawClient _client;

    public FolderClient(RawClient client)
    {
        _client = client;
        Service = new ServiceClient(_client);
    }

    public ServiceClient Service { get; }

    public async Task FooAsync(RequestOptions? options = null)
    {
        await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = "",
                Options = options
            }
        );
    }
}
