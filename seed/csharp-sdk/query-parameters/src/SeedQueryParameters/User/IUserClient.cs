namespace SeedQueryParameters;

public partial interface IUserClient
{
    Task<User> GetUsernameAsync(
        GetUsersRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
