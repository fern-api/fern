namespace SeedCsharpReadonlyRequest;

public partial interface ISeedCsharpReadonlyRequestClient
{
    WithRawResponseTask<CreateVendorResponse> BatchCreateAsync(
        CreateVendorRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
