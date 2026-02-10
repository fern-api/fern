namespace SeedLiteral;

public partial interface IInlinedClient
{
    WithRawResponseTask<SendResponse> SendAsync(
        SendLiteralsInlinedRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
