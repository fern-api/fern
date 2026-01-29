namespace SeedRequestParameters;

public partial interface IUserClient
{
    Task CreateUsernameAsync(
        CreateUsernameRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task CreateUsernameWithReferencedTypeAsync(
        CreateUsernameReferencedRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task CreateUsernameOptionalAsync(
        CreateUsernameBodyOptionalProperties? request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<User> GetUsernameAsync(
        GetUsersRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
