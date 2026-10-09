namespace SeedPlainText;

public partial interface IServiceClient
{
    WithRawResponseTask<string> GetTextAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<string> GetCsvAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<string> GetXmlAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
