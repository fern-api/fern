namespace SeedLiteral;

public partial interface IReferenceClient
{
    WithRawResponseTask<SendResponse> SendAsync(
        SendRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
