using SeedInferredAuthImplicitNoExpiry.Nested;
using SeedInferredAuthImplicitNoExpiry.NestedNoAuth;

namespace SeedInferredAuthImplicitNoExpiry;

public partial interface ISeedInferredAuthImplicitNoExpiryClient
{
    public AuthClient Auth { get; }
    public NestedNoAuthClient NestedNoAuth { get; }
    public NestedClient Nested { get; }
    public SimpleClient Simple { get; }
}
