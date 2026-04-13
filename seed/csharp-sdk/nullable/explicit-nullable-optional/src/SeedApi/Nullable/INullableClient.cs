namespace SeedApi;

public partial interface INullableClient
{
    WithRawResponseTask<IEnumerable<User>> GetusersAsync(
        NullableGetUsersRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<User> CreateuserAsync(
        NullableCreateUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<bool> DeleteuserAsync(
        NullableDeleteUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
