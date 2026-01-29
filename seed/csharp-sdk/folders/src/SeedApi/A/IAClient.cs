using SeedApi.A.B;
using SeedApi.A.C;

namespace SeedApi.A;

public partial interface IAClient
{
    public IBClient B { get; }
    public ICClient C { get; }
}
