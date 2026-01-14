namespace SeedPropertyAccess;

public partial interface ISeedPropertyAccessClient
{
    Task<User> CreateUserAsync(
        User request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
