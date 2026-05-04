namespace SeedApi;

public partial interface ISeedApiClient
{
    WithRawResponseTask<RuleTypeSearchResponse> SearchRuleTypesAsync(
        SearchRuleTypesRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<RuleResponse> CreateRuleAsync(
        RuleCreateRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<UserSearchResponse> ListUsersAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<CombinedEntity> GetEntityAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<Organization> GetOrganizationAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
