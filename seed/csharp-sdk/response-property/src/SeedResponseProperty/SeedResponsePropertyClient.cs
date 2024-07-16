using SeedResponseProperty;
using SeedResponseProperty.Core;

#nullable enable

namespace SeedResponseProperty;

public partial class SeedResponsePropertyClient
{
    private RawClient _client;

    public SeedResponsePropertyClient(ClientOptions? clientOptions = null)
    {
        _client = new RawClient(
            new Dictionary<string, string>() { { "X-Fern-Language", "C#" }, },
            clientOptions ?? new ClientOptions()
        );
        Service = new ServiceClient(_client);
    }

    public ServiceClient Service { get; init; }
}
