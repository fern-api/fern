namespace SeedApi;

public partial interface IUserEventsClient
{
    /// <summary>
    /// List all user events.
    /// </summary>
    WithRawResponseTask<IEnumerable<UserEvent>> UserEventsListEventsAsync(
        UserEventsListEventsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
