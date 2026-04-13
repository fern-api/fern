namespace SeedApi;

public partial interface IOrganizationsClient
{
    WithRawResponseTask<Organization> GetorganizationAsync(
        string tenantId,
        string organizationId,
        OrganizationsGetOrganizationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<User> GetorganizationuserAsync(
        string tenantId,
        string organizationId,
        string userId,
        OrganizationsGetOrganizationUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<IEnumerable<Organization>> SearchorganizationsAsync(
        string tenantId,
        string organizationId,
        OrganizationsSearchOrganizationsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
