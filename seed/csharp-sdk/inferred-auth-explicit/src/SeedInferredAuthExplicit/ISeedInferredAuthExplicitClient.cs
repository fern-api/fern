using SeedInferredAuthExplicit.Nested;
using SeedInferredAuthExplicit.NestedNoAuth;

namespace SeedInferredAuthExplicit;

public partial interface ISeedInferredAuthExplicitClient
{
    public AuthClient Auth { get; }
    public NestedNoAuthClient NestedNoAuth { get; }
    public NestedClient Nested { get; }
    public SimpleClient Simple { get; }
}
