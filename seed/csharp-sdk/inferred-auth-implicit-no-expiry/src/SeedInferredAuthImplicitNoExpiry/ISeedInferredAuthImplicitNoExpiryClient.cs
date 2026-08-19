using SeedInferredAuthImplicitNoExpiry.Nested;
using SeedInferredAuthImplicitNoExpiry.NestedNoAuth;

namespace SeedInferredAuthImplicitNoExpiry;

public partial interface ISeedInferredAuthImplicitNoExpiryClient
{
    public IAuthClient Auth { get; }
    public INestedNoAuthClient NestedNoAuth { get; }
    public INestedClient Nested { get; }
    public ISimpleClient Simple { get; }
}
