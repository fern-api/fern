using SeedApi.A.B;
using SeedApi.A.C;
using SeedApi.Core;

namespace SeedApi.A;

public partial class AClient : IAClient
{
    private RawClient _client;

    internal AClient(RawClient client)
    {
        _client = client;
        B = new BClient(_client);
        C = new CClient(_client);
    }

    public IBClient B { get; }

    public ICClient C { get; }
}
