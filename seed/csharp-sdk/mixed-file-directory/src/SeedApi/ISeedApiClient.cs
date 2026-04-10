namespace SeedApi;

public partial interface ISeedApiClient
{
    public IOrganizationClient Organization { get; }
    public IUserClient User { get; }
    public IUserEventsClient UserEvents { get; }
    public IUserEventsMetadataClient UserEventsMetadata { get; }
}
