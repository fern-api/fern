using SeedInferredAuthImplicitApiKey.Nested;
using SeedInferredAuthImplicitApiKey.NestedNoAuth;

namespace SeedInferredAuthImplicitApiKey;

public partial interface ISeedInferredAuthImplicitApiKeyClient
{
    public IAuthClient Auth { get; }
    public INestedNoAuthClient NestedNoAuth { get; }
    public INestedClient Nested { get; }
    public ISimpleClient Simple { get; }
}
