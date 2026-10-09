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

    /// <summary>
    /// Tests three-level allOf chain where a parent schema itself uses allOf with $ref elements. The grandparent's properties must be resolved through the nested $ref.
    /// </summary>
    WithRawResponseTask<PlantStrict> CreatePlantAsync(
        PlantPost request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Tests that when a parent's allOf contains multiple $ref entries, all of them are resolved and their properties merged.
    /// </summary>
    WithRawResponseTask<TreeRecord> CreateTreeAsync(
        TreeRecord request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
