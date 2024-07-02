using SeedApi.Core;

#nullable enable

namespace SeedApi;

public class AstClient
{
    private RawClient _client;

    public AstClient(RawClient client)
    {
        _client = client;
    }
}
