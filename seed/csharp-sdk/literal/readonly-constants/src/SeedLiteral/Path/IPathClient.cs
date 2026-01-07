namespace SeedLiteral;

public partial interface IPathClient
{
    Task<SendResponse> SendAsync(
        string id,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
