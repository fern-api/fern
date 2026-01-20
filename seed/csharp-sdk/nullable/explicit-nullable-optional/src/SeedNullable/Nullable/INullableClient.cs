namespace SeedNullable;

public partial interface INullableClient
{
    Task<IEnumerable<User>> GetUsersAsync(
        GetUsersRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<User> CreateUserAsync(
        CreateUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<bool> DeleteUserAsync(
        DeleteUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
