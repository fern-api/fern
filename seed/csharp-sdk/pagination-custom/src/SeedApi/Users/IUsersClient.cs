namespace SeedApi;

public partial interface IUsersClient
{
    WithRawResponseTask<UsersListResponse> ListwithcustompagerAsync(
        UsersListWithCustomPagerRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
