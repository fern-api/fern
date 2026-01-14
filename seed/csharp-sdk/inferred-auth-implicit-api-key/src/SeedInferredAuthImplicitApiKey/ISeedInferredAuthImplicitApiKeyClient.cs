using SeedInferredAuthImplicitApiKey.Nested;
using SeedInferredAuthImplicitApiKey.NestedNoAuth;

namespace SeedInferredAuthImplicitApiKey;

public partial interface ISeedInferredAuthImplicitApiKeyClient
{
    public AuthClient Auth { get; }
    public NestedNoAuthClient NestedNoAuth { get; }
    public NestedClient Nested { get; }
    public SimpleClient Simple { get; }
}
