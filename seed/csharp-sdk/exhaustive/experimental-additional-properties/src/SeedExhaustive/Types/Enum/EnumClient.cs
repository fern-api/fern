using SeedExhaustive.Core;

namespace SeedExhaustive.Types;

public partial class EnumClient
{
    private RawClient _client;

    internal EnumClient(RawClient client)
    {
        _client = client;
    }
}
