using SeedOauthClientCredentialsEnvironmentVariables.Nested;
using SeedOauthClientCredentialsEnvironmentVariables.NestedNoAuth;

namespace SeedOauthClientCredentialsEnvironmentVariables;

public partial interface ISeedOauthClientCredentialsEnvironmentVariablesClient
{
    public AuthClient Auth { get; }
    public NestedNoAuthClient NestedNoAuth { get; }
    public NestedClient Nested { get; }
    public SimpleClient Simple { get; }
}
