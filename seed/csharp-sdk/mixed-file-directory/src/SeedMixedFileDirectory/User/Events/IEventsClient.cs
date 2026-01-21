using SeedMixedFileDirectory;
using SeedMixedFileDirectory.User_.Events;

namespace SeedMixedFileDirectory.User_;

public partial interface IEventsClient
{
    public MetadataClient Metadata { get; }

    /// <summary>
    /// List all user events.
    /// </summary>
    WithRawResponseTask<IEnumerable<Event>> ListEventsAsync(
        ListUserEventsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
