using SeedFileUpload;
using SeedFileUpload.Core;

#nullable enable

namespace SeedFileUpload;

public partial class SeedFileUploadClient
{
    private RawClient _client;

    public SeedFileUploadClient(ClientOptions? clientOptions = null)
    {
        _client = new RawClient(
            new Dictionary<string, string>() { { "X-Fern-Language", "C#" }, },
            clientOptions ?? new ClientOptions()
        );
        Service = new ServiceClient(_client);
    }

    public ServiceClient Service { get; }
}
