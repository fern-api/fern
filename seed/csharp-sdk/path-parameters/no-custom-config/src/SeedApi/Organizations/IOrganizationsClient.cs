namespace SeedApi;

public partial interface IOrganizationsClient
{
    WithRawResponseTask<Organization> GetorganizationAsync(
        OrganizationsGetOrganizationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<User> GetorganizationuserAsync(
        OrganizationsGetOrganizationUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<IEnumerable<Organization>> SearchorganizationsAsync(
        OrganizationsSearchOrganizationsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
