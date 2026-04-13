namespace SeedApi;

public partial interface IUserEventsMetadataClient
{
    /// <summary>
    /// Get event metadata.
    /// </summary>
    WithRawResponseTask<UsereventsMetadata> UserEventsMetadataGetMetadataAsync(
        UserEventsMetadataGetMetadataRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
