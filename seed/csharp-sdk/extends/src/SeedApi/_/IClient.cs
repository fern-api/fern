namespace SeedApi;

public partial interface IClient
{
    Task ExtendedInlineRequestBodyAsync(
        ExtendedInlineRequestBodyRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
