using SeedFileUpload.Core;

namespace SeedFileUpload;

public partial class SeedFileUploadClient : ISeedFileUploadClient
{
    private readonly RawClient _client;

    public SeedFileUploadClient(ClientOptions? clientOptions = null)
    {
        clientOptions ??= new ClientOptions();
        var platformHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedFileUpload" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernfile-upload/0.0.1" },
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
