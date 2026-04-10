namespace SeedApi;

public partial interface IClient
{
    WithRawResponseTask<Account> GetAccountAsync(
        GetAccountRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
