using SeedExhaustive;

namespace SeedExhaustive.Endpoints.Urls;

public partial interface IUrlsClient
{
    Task<string> WithMixedCaseAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<string> NoEndingSlashAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<string> WithEndingSlashAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<string> WithUnderscoresAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
