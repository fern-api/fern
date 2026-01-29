using SeedExhaustive;

namespace SeedExhaustive.Endpoints.Urls;

public partial interface IUrlsClient
{
    WithRawResponseTask<string> WithMixedCaseAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<string> NoEndingSlashAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<string> WithEndingSlashAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<string> WithUnderscoresAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
