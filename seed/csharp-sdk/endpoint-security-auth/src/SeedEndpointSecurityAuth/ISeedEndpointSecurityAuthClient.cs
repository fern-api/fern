namespace SeedEndpointSecurityAuth;

public partial interface ISeedEndpointSecurityAuthClient
{
    public IAuthClient Auth { get; }
    public IUserClient User { get; }
}
