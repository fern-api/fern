namespace SeedUnionQueryParameters;

public partial interface IEventsClient
{
    /// <summary>
    /// Subscribe to events with a oneOf-style query parameter that may be a
    /// scalar enum value or a list of enum values.
    /// </summary>
    WithRawResponseTask<string> SubscribeAsync(
        SubscribeEventsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
