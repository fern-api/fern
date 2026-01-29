namespace SeedLiteral;

public partial interface IPathClient
{
    WithRawResponseTask<SendResponse> SendAsync(
        string id,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
