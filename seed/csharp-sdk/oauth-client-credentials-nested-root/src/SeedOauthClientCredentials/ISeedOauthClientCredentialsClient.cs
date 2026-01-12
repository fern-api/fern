using SeedOauthClientCredentials.Auth;
using SeedOauthClientCredentials.Nested;
using SeedOauthClientCredentials.NestedNoAuth;

namespace SeedOauthClientCredentials;

public partial interface ISeedOauthClientCredentialsClient
{
    public AuthClient Auth { get; }
    public NestedNoAuthClient NestedNoAuth { get; }
    public NestedClient Nested { get; }
    public SimpleClient Simple { get; }
}
