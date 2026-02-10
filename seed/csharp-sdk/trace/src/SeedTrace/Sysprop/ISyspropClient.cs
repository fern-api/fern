namespace SeedTrace;

public partial interface ISyspropClient
{
    Task SetNumWarmInstancesAsync(
        Language language,
        int numWarmInstances,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<Dictionary<Language, int>> GetNumWarmInstancesAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
