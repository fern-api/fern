namespace SeedApi;

public partial interface ISeedApiClient
{
    WithRawResponseTask<Account> GetAccountAsync(
        string accountId,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
