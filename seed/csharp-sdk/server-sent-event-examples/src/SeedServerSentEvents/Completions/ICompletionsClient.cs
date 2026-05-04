namespace SeedServerSentEvents;

public partial interface ICompletionsClient
{
    IAsyncEnumerable<StreamedCompletion> StreamAsync(
        StreamCompletionRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    IAsyncEnumerable<StreamEvent> StreamEventsAsync(
        StreamEventsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    IAsyncEnumerable<StreamEventDiscriminantInData> StreamEventsDiscriminantInDataAsync(
        StreamEventsDiscriminantInDataRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    IAsyncEnumerable<StreamEventContextProtocol> StreamEventsContextProtocolAsync(
        StreamEventsContextProtocolRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
