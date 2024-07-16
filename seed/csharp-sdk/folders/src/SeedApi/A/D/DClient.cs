using SeedApi.A.D;
using SeedApi.Core;

#nullable enable

namespace SeedApi.A.D;

public class DClient
{
    private RawClient _client;

    public DClient(RawClient client)
    {
        _client = client;
        Types = new TypesClient(_client);
    }

    public TypesClient Types { get; }
}
