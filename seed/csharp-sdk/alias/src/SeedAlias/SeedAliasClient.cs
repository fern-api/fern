using SeedAlias.Core;

#nullable enable

namespace SeedAlias;

public partial class SeedAliasClient
{
    private RawClient _client;

    public SeedAliasClient(ClientOptions? clientOptions = null)
    {
        _client = new RawClient(
            new Dictionary<string, string>() { { "X-Fern-Language", "C#" }, },
            clientOptions ?? new ClientOptions()
        );
    }
}
