using SeedObject.Core;

#nullable enable

namespace SeedObject;

public partial class SeedObjectClient
{
    private RawClient _client;

    public SeedObjectClient(ClientOptions? clientOptions = null)
    {
        _client = new RawClient(
            new Dictionary<string, string>() { { "X-Fern-Language", "C#" }, },
            clientOptions ?? new ClientOptions()
        );
    }
}
