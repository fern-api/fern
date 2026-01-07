namespace SeedServerSentEvents;

public partial interface ICompletionsClient
{
    Task<IAsyncEnumerable<StreamedCompletion>> StreamAsync(
        StreamCompletionRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
