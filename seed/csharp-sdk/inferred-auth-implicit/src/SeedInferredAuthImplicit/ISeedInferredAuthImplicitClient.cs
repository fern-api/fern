using SeedInferredAuthImplicit.Nested;
using SeedInferredAuthImplicit.NestedNoAuth;

namespace SeedInferredAuthImplicit;

public partial interface ISeedInferredAuthImplicitClient
{
    public IAuthClient Auth { get; }
    public INestedNoAuthClient NestedNoAuth { get; }
    public INestedClient Nested { get; }
    public ISimpleClient Simple { get; }
}
