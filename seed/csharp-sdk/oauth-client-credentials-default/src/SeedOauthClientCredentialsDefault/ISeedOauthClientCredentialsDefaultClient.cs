using SeedOauthClientCredentialsDefault.Nested;
using SeedOauthClientCredentialsDefault.NestedNoAuth;

namespace SeedOauthClientCredentialsDefault;

public partial interface ISeedOauthClientCredentialsDefaultClient
{
    public AuthClient Auth { get; }
    public NestedNoAuthClient NestedNoAuth { get; }
    public NestedClient Nested { get; }
    public SimpleClient Simple { get; }
}
