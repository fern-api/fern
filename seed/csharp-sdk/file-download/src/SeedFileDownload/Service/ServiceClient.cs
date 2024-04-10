using SeedFileDownload;

namespace SeedFileDownload;

public class ServiceClient
{
    private RawClient _client;

    public ServiceClient(RawClient client)
    {
        _client = client;
    }

    public async void DownloadFileAsync() { }
}
