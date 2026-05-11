using SeedOauthClientCredentialsMandatoryAuth.Nested;

namespace SeedOauthClientCredentialsMandatoryAuth;

public partial interface ISeedOauthClientCredentialsMandatoryAuthClient
{
    public IAuthClient Auth { get; }
    public INestedClient Nested { get; }
    public ISimpleClient Simple { get; }
}
