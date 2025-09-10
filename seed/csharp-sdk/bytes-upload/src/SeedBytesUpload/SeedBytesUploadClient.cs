using SeedBytesUpload.Core;

namespace SeedBytesUpload;

public partial class SeedBytesUploadClient
{
    private readonly RawClient _client;

    public SeedBytesUploadClient(ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedBytesUpload" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernbytes-upload/0.0.1" },
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
    }

    public ServiceClient Service { get; }
}
