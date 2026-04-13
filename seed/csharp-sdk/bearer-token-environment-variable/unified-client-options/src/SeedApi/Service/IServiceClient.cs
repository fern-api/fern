namespace SeedApi;

public partial interface IServiceClient
{
    /// <summary>
    /// GET request with custom api key
    /// </summary>
    WithRawResponseTask<string> GetwithbearertokenAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
