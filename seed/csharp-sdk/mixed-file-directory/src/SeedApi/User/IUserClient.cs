namespace SeedApi;

public partial interface IUserClient
{
    /// <summary>
    /// List all users.
    /// </summary>
    WithRawResponseTask<IEnumerable<User>> ListAsync(
        UserListRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
