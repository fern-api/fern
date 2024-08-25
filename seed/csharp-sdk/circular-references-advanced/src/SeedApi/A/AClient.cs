using SeedApi.Core;

#nullable enable

namespace SeedApi;

public partial class AClient
{
    private RawClient _client;

    internal AClient(RawClient client)
    {
        _client = client;
    }
}
