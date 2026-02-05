namespace SeedPathParameters;

public partial interface ISeedPathParametersClient
{
    public IOrganizationsClient Organizations { get; }
    public IUserClient User { get; }
}
