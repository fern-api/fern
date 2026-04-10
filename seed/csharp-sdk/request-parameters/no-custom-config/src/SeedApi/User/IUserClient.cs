namespace SeedApi;

public partial interface IUserClient
{
    Task CreateusernameAsync(
        UserCreateUsernameRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task CreateusernamewithreferencedtypeAsync(
        CreateUsernameBody request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task CreateusernameoptionalAsync(
        CreateUsernameBodyOptionalProperties request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<User> GetusernameAsync(
        UserGetUsernameRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
