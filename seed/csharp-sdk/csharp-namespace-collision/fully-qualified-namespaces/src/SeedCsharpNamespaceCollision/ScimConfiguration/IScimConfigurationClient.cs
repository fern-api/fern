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

    WithRawResponseTask<IEnumerable<User>> ListUsersAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
