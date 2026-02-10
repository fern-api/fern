namespace SeedEndpointSecurityAuth;

public partial interface IUserClient
{
    WithRawResponseTask<IEnumerable<User>> GetWithBearerAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<IEnumerable<User>> GetWithApiKeyAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<IEnumerable<User>> GetWithOAuthAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<IEnumerable<User>> GetWithBasicAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<IEnumerable<User>> GetWithInferredAuthAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<IEnumerable<User>> GetWithAnyAuthAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<IEnumerable<User>> GetWithAllAuthAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
