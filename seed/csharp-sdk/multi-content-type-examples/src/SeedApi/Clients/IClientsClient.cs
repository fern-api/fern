namespace SeedApi;

public partial interface IClientsClient
{
    WithRawResponseTask<ClientResponse> CreateAsync(
        ClientRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
