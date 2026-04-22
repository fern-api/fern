namespace SeedServerSentEvents;

public partial interface ICompletionsClient
{
    IAsyncEnumerable<StreamedCompletion> StreamAsync(
        StreamCompletionRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    IAsyncEnumerable<StreamedCompletion> StreamWithoutTerminatorAsync(
        StreamCompletionRequestWithoutTerminator request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
