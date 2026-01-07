namespace SeedLiteral;

public partial interface IReferenceClient
{
    Task<SendResponse> SendAsync(
        SendRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
