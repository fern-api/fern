using SeedApi.A.B;
using SeedApi.A.C;

namespace SeedApi.A;

public partial interface IAClient
{
    public BClient B { get; }
    public CClient C { get; }
}
