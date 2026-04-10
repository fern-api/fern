namespace SeedApi;

public partial interface IClient
{
    WithRawResponseTask<string> EchoAsync(
        EchoRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
