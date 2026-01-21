namespace SeedLiteral;

public partial interface IQueryClient
{
    WithRawResponseTask<SendResponse> SendAsync(
        SendLiteralsInQueryRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
