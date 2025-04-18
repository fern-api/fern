using SeedApi.Core;

namespace SeedApi;

public partial class AClient
{
    private RawClient _client;

    internal AClient(RawClient client)
    {
        _client = client;
    }
}
