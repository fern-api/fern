using SeedBytes;
using SeedBytes.Core;

#nullable enable

namespace SeedBytes;

public partial class SeedBytesClient
{
    private RawClient _client;

    public SeedBytesClient(ClientOptions? clientOptions = null)
    {
        _client = new RawClient(
            new Dictionary<string, string>() { { "X-Fern-Language", "C#" }, },
            clientOptions ?? new ClientOptions()
        );
        Service = new ServiceClient(_client);
    }

    public ServiceClient Service { get; }
}
