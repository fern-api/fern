namespace SeedApi;

public partial interface ISeedApiClient
{
    Task<Account> GetAccountAsync(
        string accountId,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
