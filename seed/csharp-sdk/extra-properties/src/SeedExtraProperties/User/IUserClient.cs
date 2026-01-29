namespace SeedExtraProperties;

public partial interface IUserClient
{
    WithRawResponseTask<User> CreateUserAsync(
        CreateUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
