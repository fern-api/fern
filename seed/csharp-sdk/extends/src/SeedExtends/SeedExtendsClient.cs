using SeedExtends.Core;

#nullable enable

namespace SeedExtends;

public partial class SeedExtendsClient
{
    private RawClient _client;

    public SeedExtendsClient(ClientOptions? clientOptions = null)
    {
        _client = new RawClient(
            new Dictionary<string, string>() { { "X-Fern-Language", "C#" }, },
            clientOptions ?? new ClientOptions()
        );
    }
}
