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
        Raw = new RawAccessClient(_client);
    }

    public BClient B { get; }

    public CClient C { get; }

    public AClient.RawAccessClient Raw { get; }

    public partial class RawAccessClient
    {
        private readonly RawClient _client;

        internal RawAccessClient(RawClient client)
        {
            _client = client;
        }
    }
}
