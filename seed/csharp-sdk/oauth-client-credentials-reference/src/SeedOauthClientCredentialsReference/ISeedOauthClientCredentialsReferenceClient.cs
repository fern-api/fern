namespace SeedOauthClientCredentialsReference;

public partial interface ISeedOauthClientCredentialsReferenceClient
{
    public IAuthClient Auth { get; }
    public ISimpleClient Simple { get; }
}
