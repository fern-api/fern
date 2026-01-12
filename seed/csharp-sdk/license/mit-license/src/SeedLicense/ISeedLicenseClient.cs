namespace SeedLicense;

public partial interface ISeedLicenseClient
{
    Task GetAsync(RequestOptions? options = null, CancellationToken cancellationToken = default);
}
