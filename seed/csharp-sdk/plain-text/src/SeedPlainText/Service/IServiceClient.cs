namespace SeedPlainText;

public partial interface IServiceClient
{
    Task<string> GetTextAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
