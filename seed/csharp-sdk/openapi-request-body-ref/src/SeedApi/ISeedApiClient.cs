namespace SeedApi;

public partial interface ISeedApiClient
{
    public IVendorClient Vendor { get; }
    public ICatalogClient Catalog { get; }
    public ITeamMemberClient TeamMember { get; }
}
