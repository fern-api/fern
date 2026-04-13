namespace SeedApi;

public partial interface IClient
{
    WithRawResponseTask<CreateVendorResponse> BatchCreateAsync(
        CreateVendorRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
