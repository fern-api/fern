using SeedFileDownload.Core;

namespace SeedFileDownload;

public partial class SeedFileDownloadClient : ISeedFileDownloadClient
{
    private readonly RawClient _client;

    public SeedFileDownloadClient(ClientOptions? clientOptions = null)
    {
        clientOptions ??= new ClientOptions();
        var platformHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedFileDownload" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernfile-download/0.0.1" },
            }
        );
        foreach (var header in platformHeaders)
        {
            if (!clientOptions.Headers.ContainsKey(header.Key))
            {
                clientOptions.Headers[header.Key] = header.Value;
            }
        }
        _client = new RawClient(clientOptions);
        Service = new ServiceClient(_client);
    }

    public ServiceClient Service { get; }
}
