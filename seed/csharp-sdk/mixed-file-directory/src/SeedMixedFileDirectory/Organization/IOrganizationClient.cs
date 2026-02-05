namespace SeedMixedFileDirectory;

public partial interface IOrganizationClient
{
    /// <summary>
    /// Create a new organization.
    /// </summary>
    WithRawResponseTask<Organization> CreateAsync(
        CreateOrganizationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
