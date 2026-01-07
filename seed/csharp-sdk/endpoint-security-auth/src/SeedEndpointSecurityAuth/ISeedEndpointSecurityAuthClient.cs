namespace SeedEndpointSecurityAuth;

public partial interface ISeedEndpointSecurityAuthClient
{
    public AuthClient Auth { get; }
    public UserClient User { get; }
}
