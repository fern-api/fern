using SeedApiWideBasePath;
using SeedApiWideBasePath.Core;

#nullable enable

namespace SeedApiWideBasePath;

public partial class SeedApiWideBasePathClient
{
    private RawClient _client;

    public SeedApiWideBasePathClient(ClientOptions? clientOptions = null)
    {
        _client = new RawClient(
            new Dictionary<string, string>() { { "X-Fern-Language", "C#" }, },
            clientOptions ?? new ClientOptions()
        );
        Service = new ServiceClient(_client);
    }

    public ServiceClient Service { get; init; }
}
