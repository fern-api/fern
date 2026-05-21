namespace SeedApi;

public partial interface ISeedApiClient
{
    WithRawResponseTask<IEnumerable<User>> ListUsersAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<User> GetUserAsync(
        GetUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<IEnumerable<Invoice>> ListInvoicesAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<Invoice> GetInvoiceAsync(
        GetInvoiceRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
