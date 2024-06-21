using SeedFileDownload;

#nullable enable

namespace SeedFileDownload;

public class ServiceClient
{
    private RawClient _client;

    public ServiceClient(RawClient client)
    {
        _client = client;
    }

    public async void DownloadFileAsync()
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest { Method = HttpMethod.Post, Path = "" }
        );
    }
}
