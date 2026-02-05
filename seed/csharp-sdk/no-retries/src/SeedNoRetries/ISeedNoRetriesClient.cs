namespace SeedNoRetries;

public partial interface ISeedNoRetriesClient
{
    public IRetriesClient Retries { get; }
}
