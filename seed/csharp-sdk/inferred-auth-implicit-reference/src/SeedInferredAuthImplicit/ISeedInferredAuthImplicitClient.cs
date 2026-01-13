using SeedInferredAuthImplicit.Nested;
using SeedInferredAuthImplicit.NestedNoAuth;

namespace SeedInferredAuthImplicit;

public partial interface ISeedInferredAuthImplicitClient
{
    public AuthClient Auth { get; }
    public NestedNoAuthClient NestedNoAuth { get; }
    public NestedClient Nested { get; }
    public SimpleClient Simple { get; }
}
