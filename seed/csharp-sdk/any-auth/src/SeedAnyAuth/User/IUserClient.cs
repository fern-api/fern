namespace SeedAnyAuth;

public partial interface IUserClient
{
    Task<IEnumerable<User>> GetAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<IEnumerable<User>> GetAdminsAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
