namespace SeedPathParameters;

public partial interface IOrganizationsClient
{
    WithRawResponseTask<Organization> GetOrganizationAsync(
        string tenantId,
        string organizationId,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<User> GetOrganizationUserAsync(
        string tenantId,
        string organizationId,
        string userId,
        GetOrganizationUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<IEnumerable<Organization>> SearchOrganizationsAsync(
        string tenantId,
        string organizationId,
        SearchOrganizationsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
