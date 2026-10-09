namespace SeedApi;

public partial interface ISeedApiClient
{
    WithRawResponseTask<IEnumerable<User>> GetUsersAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<User> GetUserAsync(
        GetUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
