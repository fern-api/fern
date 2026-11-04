namespace SeedCsharpEndpointSecurityOptionalAuth;

public partial interface IUserClient
{
    WithRawResponseTask<User> GetUserAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
