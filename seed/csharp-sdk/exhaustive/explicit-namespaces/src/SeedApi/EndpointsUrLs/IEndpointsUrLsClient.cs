using SeedApi;

namespace SeedApi.EndpointsUrLs;

public partial interface IEndpointsUrLsClient
{
    WithRawResponseTask<string> EndpointsUrlsWithMixedCaseAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<string> EndpointsUrlsNoEndingSlashAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<string> EndpointsUrlsWithEndingSlashAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<string> EndpointsUrlsWithUnderscoresAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
