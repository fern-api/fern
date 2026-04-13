namespace SeedApi;

public partial interface IUsersClient
{
    /// <summary>
    /// Gets a user by ID. The deleted_at field uses type null.
    /// </summary>
    WithRawResponseTask<User> GetAsync(
        GetUsersRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
