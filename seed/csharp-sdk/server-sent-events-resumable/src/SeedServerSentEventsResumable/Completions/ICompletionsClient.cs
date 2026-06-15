namespace SeedServerSentEventsResumable;

public partial interface ICompletionsClient
{
    WithRawResponseStream<StreamedCompletion> StreamAsync(
        StreamCompletionRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseStream<StreamedCompletion> StreamNonResumableAsync(
        StreamCompletionRequestNonResumable request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
