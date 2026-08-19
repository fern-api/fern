namespace SeedServerSentEvents;

public partial interface ICompletionsClient
{
    WithRawResponseStream<StreamedCompletion> StreamAsync(
        StreamCompletionRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseStream<StreamEvent> StreamEventsAsync(
        StreamEventsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseStream<StreamEventDiscriminantInData> StreamEventsDiscriminantInDataAsync(
        StreamEventsDiscriminantInDataRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseStream<StreamEventContextProtocol> StreamEventsContextProtocolAsync(
        StreamEventsContextProtocolRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
