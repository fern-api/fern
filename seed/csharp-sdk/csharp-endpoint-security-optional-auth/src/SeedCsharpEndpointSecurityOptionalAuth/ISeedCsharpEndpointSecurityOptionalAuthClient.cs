namespace SeedCsharpEndpointSecurityOptionalAuth;

public partial interface ISeedCsharpEndpointSecurityOptionalAuthClient
{
    public IAuthClient Auth { get; }
    public IUserClient User { get; }
}
