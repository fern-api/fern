namespace SeedAnyAuth;

public partial interface IUserClient
{
    WithRawResponseTask<IEnumerable<User>> GetAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<IEnumerable<User>> GetAdminsAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
