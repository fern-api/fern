namespace SeedNullable;

public partial interface INullableClient
{
    WithRawResponseTask<IEnumerable<User>> GetUsersAsync(
        GetUsersRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<User> CreateUserAsync(
        CreateUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<bool> DeleteUserAsync(
        DeleteUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
