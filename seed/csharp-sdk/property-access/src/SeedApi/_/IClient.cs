namespace SeedApi;

public partial interface IClient
{
    WithRawResponseTask<User> CreateUserAsync(
        User request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
