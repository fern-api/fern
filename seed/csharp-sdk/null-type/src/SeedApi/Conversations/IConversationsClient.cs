namespace SeedApi;

public partial interface IConversationsClient
{
    /// <summary>
    /// Place an outbound call or validate call setup with dry_run.
    /// </summary>
    WithRawResponseTask<OutboundCallConversationsResponse> OutboundcallAsync(
        ConversationsOutboundCallRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
