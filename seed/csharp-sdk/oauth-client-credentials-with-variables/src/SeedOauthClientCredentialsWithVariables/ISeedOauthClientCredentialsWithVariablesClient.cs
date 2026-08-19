using SeedOauthClientCredentialsWithVariables.Nested;
using SeedOauthClientCredentialsWithVariables.NestedNoAuth;

namespace SeedOauthClientCredentialsWithVariables;

public partial interface ISeedOauthClientCredentialsWithVariablesClient
{
    public IAuthClient Auth { get; }
    public INestedNoAuthClient NestedNoAuth { get; }
    public INestedClient Nested { get; }
    public IServiceClient Service { get; }
    public ISimpleClient Simple { get; }
}
