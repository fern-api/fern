namespace SeedApi;

public partial interface ISeedApiClient
{
    public IOrganizationsClient Organizations { get; }
    public IUserClient User { get; }
}
