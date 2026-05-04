namespace SeedApi;

public partial interface IVendorClient
{
    WithRawResponseTask<Vendor> UpdateVendorAsync(
        UpdateVendorBody request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<Vendor> CreateVendorAsync(
        CreateVendorRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
