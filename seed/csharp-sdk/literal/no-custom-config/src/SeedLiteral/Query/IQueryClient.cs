namespace SeedLiteral;

public partial interface IQueryClient
{
    Task<SendResponse> SendAsync(
        SendLiteralsInQueryRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
