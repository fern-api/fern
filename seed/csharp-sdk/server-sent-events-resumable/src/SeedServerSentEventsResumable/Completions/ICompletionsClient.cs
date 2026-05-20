namespace SeedServerSentEventsResumable;

public partial interface ICompletionsClient
{
    IAsyncEnumerable<StreamedCompletion> StreamAsync(
        StreamCompletionRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    IAsyncEnumerable<StreamedCompletion> StreamNonResumableAsync(
        StreamCompletionRequestNonResumable request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
