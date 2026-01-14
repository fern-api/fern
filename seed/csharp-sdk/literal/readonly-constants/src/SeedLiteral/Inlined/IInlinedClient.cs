namespace SeedLiteral;

public partial interface IInlinedClient
{
    Task<SendResponse> SendAsync(
        SendLiteralsInlinedRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
