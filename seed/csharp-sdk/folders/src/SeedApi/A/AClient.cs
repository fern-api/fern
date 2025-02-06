using SeedApi.Core;
using SeedApi.A.B;
using SeedApi.A.C;
using SeedApi.A.D;

    namespace SeedApi.A;

public partial class AClient
{
    private RawClient _client;

    internal AClient (RawClient client) {
        _client = client;
        B = 
        new BClient(
            _client
        );
        C = 
        new CClient(
            _client
        );
        D = 
        new DClient(
            _client
        );
    }

    public BClient B { get; }

    public CClient C { get; }

    public DClient D { get; }

}
