namespace SeedNoRetries;

public partial interface ISeedNoRetriesClient
{
    public RetriesClient Retries { get; }
}
