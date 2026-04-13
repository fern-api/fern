namespace SeedApi;

public partial interface ISeedApiClient
{
    public IClient _ { get; }
    public IScimconfigurationClient Scimconfiguration { get; }
    public ISystemClient System { get; }
}
