namespace SeedPropertyAccess;

public partial interface ISeedPropertyAccessClient
{
    WithRawResponseTask<User> CreateUserAsync(
        User request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
