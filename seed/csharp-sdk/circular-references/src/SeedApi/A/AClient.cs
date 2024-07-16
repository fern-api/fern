using SeedApi.Core;

#nullable enable

namespace SeedApi;

public class AClient
{
    private RawClient _client;

    public AClient(RawClient client)
    {
        _client = client;
    }
}
