namespace SeedPathParameters;

public partial interface ISeedPathParametersClient
{
    public OrganizationsClient Organizations { get; }
    public UserClient User { get; }
}
