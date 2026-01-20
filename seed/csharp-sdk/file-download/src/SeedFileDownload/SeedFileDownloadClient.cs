using SeedFileDownload.Core;

namespace SeedFileDownload;

public partial class SeedFileDownloadClient : ISeedFileDownloadClient
{
    private readonly RawClient _client;

    public SeedFileDownloadClient(ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedFileDownload" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernfile-download/0.0.1" },
            }
        );
        clientOptions ??= new ClientOptions();
        foreach (var header in defaultHeaders)
        {
            if (!clientOptions.Headers.ContainsKey(header.Key))
            {
                clientOptions.Headers[header.Key] = header.Value;
            }
        }
        _client = new RawClient(clientOptions);
        Service = new ServiceClient(_client);
        Raw = new WithRawResponseClient(_client);
    }

    public ServiceClient Service { get; }

    public SeedFileDownloadClient.WithRawResponseClient Raw { get; }

    public partial class WithRawResponseClient
    {
        private readonly RawClient _client;

        internal WithRawResponseClient(RawClient client)
        {
            _client = client;
        }
    }
}
