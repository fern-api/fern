using SeedCsharpNamespaceCollision;

namespace SeedCsharpNamespaceCollision.ScimConfiguration;

public partial interface IScimConfigurationClient
{
    WithRawResponseTask<ScimConfiguration> GetConfigurationAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<ScimToken> CreateTokenAsync(
        ScimToken request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<IEnumerable<SeedCsharpNamespaceCollision.User>> ListUsersAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
