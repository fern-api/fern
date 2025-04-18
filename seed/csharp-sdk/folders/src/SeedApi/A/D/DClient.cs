using SeedApi.Core;

namespace SeedApi.A.D;

public partial class DClient
{
    private RawClient _client;

    internal DClient(RawClient client)
    {
        _client = client;
        Types = new TypesClient(_client);
    }

    public TypesClient Types { get; }
}
