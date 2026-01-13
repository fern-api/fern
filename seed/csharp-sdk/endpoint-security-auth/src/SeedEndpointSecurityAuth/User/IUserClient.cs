namespace SeedEndpointSecurityAuth;

public partial interface IUserClient
{
    Task<IEnumerable<User>> GetWithBearerAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<IEnumerable<User>> GetWithApiKeyAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<IEnumerable<User>> GetWithOAuthAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<IEnumerable<User>> GetWithBasicAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<IEnumerable<User>> GetWithInferredAuthAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<IEnumerable<User>> GetWithAnyAuthAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<IEnumerable<User>> GetWithAllAuthAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
