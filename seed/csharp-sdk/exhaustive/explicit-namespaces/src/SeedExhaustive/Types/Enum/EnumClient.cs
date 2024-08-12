using SeedExhaustive.Core;

#nullable enable

namespace SeedExhaustive.Types.Enum;

public partial class EnumClient
{
    private RawClient _client;

    internal EnumClient(RawClient client)
    {
        _client = client;
    }
}
