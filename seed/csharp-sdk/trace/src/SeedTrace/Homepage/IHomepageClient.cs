namespace SeedTrace;

public partial interface IHomepageClient
{
    WithRawResponseTask<IEnumerable<string>> GetHomepageProblemsAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task SetHomepageProblemsAsync(
        IEnumerable<string> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
