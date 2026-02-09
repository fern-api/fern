using SeedOauthClientCredentialsDefault.Nested;
using SeedOauthClientCredentialsDefault.NestedNoAuth;

namespace SeedOauthClientCredentialsDefault;

public partial interface ISeedOauthClientCredentialsDefaultClient
{
    public IAuthClient Auth { get; }
    public INestedNoAuthClient NestedNoAuth { get; }
    public INestedClient Nested { get; }
    public ISimpleClient Simple { get; }
}
