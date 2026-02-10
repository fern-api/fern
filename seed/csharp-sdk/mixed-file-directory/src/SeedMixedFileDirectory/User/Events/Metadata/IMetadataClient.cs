using SeedMixedFileDirectory;

namespace SeedMixedFileDirectory.User_.Events;

public partial interface IMetadataClient
{
    /// <summary>
    /// Get event metadata.
    /// </summary>
    WithRawResponseTask<Metadata> GetMetadataAsync(
        GetEventMetadataRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
