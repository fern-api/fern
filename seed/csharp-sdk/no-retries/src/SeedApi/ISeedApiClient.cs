namespace SeedApi;

public partial interface ISeedApiClient
{
    public IRetriesClient Retries { get; }
}
