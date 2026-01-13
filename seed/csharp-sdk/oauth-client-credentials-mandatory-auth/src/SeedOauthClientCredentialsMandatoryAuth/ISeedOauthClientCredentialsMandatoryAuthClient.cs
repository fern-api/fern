using SeedOauthClientCredentialsMandatoryAuth.Nested;

namespace SeedOauthClientCredentialsMandatoryAuth;

public partial interface ISeedOauthClientCredentialsMandatoryAuthClient
{
    public AuthClient Auth { get; }
    public NestedClient Nested { get; }
    public SimpleClient Simple { get; }
}
