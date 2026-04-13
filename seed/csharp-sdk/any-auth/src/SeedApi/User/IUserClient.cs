namespace SeedApi;

public partial interface IUserClient
{
    WithRawResponseTask<IEnumerable<User>> GetAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<IEnumerable<User>> GetadminsAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
