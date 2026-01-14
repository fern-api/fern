namespace SeedExtraProperties;

public partial interface IUserClient
{
    Task<User> CreateUserAsync(
        CreateUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
