using SeedInferredAuthExplicit.Nested;
using SeedInferredAuthExplicit.NestedNoAuth;

namespace SeedInferredAuthExplicit;

public partial interface ISeedInferredAuthExplicitClient
{
    public IAuthClient Auth { get; }
    public INestedNoAuthClient NestedNoAuth { get; }
    public INestedClient Nested { get; }
    public ISimpleClient Simple { get; }
}
