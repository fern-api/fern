namespace SeedApi;

public partial interface IServiceClient
{
    WithRawResponseTask<string> GettextAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
