using SeedApi.Core;

namespace SeedApi;

public partial class AstClient
{
    private RawClient _client;

    internal AstClient(RawClient client)
    {
        _client = client;
    }
}
