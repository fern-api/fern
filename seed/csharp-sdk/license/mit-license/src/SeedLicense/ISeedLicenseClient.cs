namespace SeedLicense;

public partial interface ISeedLicenseClient
{
    WithRawResponseTask GetAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
