using SeedApi.Core;

namespace SeedApi.A.D;

public partial class TypesClient
{
    private RawClient _client;

    internal TypesClient(RawClient client)
    {
        _client = client;
    }
}
