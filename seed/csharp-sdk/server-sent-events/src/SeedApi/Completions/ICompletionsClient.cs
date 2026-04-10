namespace SeedApi;

public partial interface ICompletionsClient
{
    WithRawResponseTask<global::System.IO.Stream> StreamAsync(
        CompletionsStreamRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<global::System.IO.Stream> StreamwithoutterminatorAsync(
        CompletionsStreamWithoutTerminatorRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
