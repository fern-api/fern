namespace SeedServerSentEvents;

public partial interface ICompletionsClient
{
    WithRawResponseStream<StreamedCompletion> StreamAsync(
        StreamCompletionRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseStream<StreamedCompletion> StreamWithoutTerminatorAsync(
        StreamCompletionRequestWithoutTerminator request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
