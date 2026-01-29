using SeedOauthClientCredentials.Nested;
using SeedOauthClientCredentials.NestedNoAuth;

namespace SeedOauthClientCredentials;

public partial interface ISeedOauthClientCredentialsClient
{
    public IAuthClient Auth { get; }
    public INestedNoAuthClient NestedNoAuth { get; }
    public INestedClient Nested { get; }
    public ISimpleClient Simple { get; }
}
