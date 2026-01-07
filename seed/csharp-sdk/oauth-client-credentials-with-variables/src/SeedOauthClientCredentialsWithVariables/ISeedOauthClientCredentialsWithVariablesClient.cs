using SeedOauthClientCredentialsWithVariables.Nested;
using SeedOauthClientCredentialsWithVariables.NestedNoAuth;

namespace SeedOauthClientCredentialsWithVariables;

public partial interface ISeedOauthClientCredentialsWithVariablesClient
{
    public AuthClient Auth { get; }
    public NestedNoAuthClient NestedNoAuth { get; }
    public NestedClient Nested { get; }
    public ServiceClient Service { get; }
    public SimpleClient Simple { get; }
}
