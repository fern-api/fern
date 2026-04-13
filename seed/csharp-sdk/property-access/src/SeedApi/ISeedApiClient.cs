namespace SeedApi;

public partial interface ISeedApiClient
{
    WithRawResponseTask<User> CreateUserAsync(
        User request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
