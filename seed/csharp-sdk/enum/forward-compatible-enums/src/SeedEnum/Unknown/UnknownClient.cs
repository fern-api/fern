using SeedEnum.Core;

namespace SeedEnum;

public partial class UnknownClient
{
    private RawClient _client;

    internal UnknownClient(RawClient client)
    {
        _client = client;
    }
}
