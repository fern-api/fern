namespace SeedPlainText;

public partial interface IServiceClient
{
    WithRawResponseTask<string> GetTextAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
