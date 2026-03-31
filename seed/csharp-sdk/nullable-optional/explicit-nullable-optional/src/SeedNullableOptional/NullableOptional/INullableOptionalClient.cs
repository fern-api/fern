namespace SeedNullableOptional;

public partial interface INullableOptionalClient
{
    /// <summary>
    /// Get a user by ID
    /// </summary>
    WithRawResponseTask<UserResponse> GetUserAsync(
        string userId,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Create a new user
    /// </summary>
    WithRawResponseTask<UserResponse> CreateUserAsync(
        CreateUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Update a user (partial update)
    /// </summary>
    WithRawResponseTask<UserResponse> UpdateUserAsync(
        string userId,
        UpdateUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// List all users
    /// </summary>
    WithRawResponseTask<IEnumerable<UserResponse>> ListUsersAsync(
        ListUsersRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Search users
    /// </summary>
    WithRawResponseTask<IEnumerable<UserResponse>> SearchUsersAsync(
        SearchUsersRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Create a complex profile to test nullable enums and unions
    /// </summary>
    WithRawResponseTask<ComplexProfile> CreateComplexProfileAsync(
        ComplexProfile request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Get a complex profile by ID
    /// </summary>
    WithRawResponseTask<ComplexProfile> GetComplexProfileAsync(
        string profileId,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Update complex profile to test nullable field updates
    /// </summary>
    WithRawResponseTask<ComplexProfile> UpdateComplexProfileAsync(
        string profileId,
        UpdateComplexProfileRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Test endpoint for validating null deserialization
    /// </summary>
    WithRawResponseTask<DeserializationTestResponse> TestDeserializationAsync(
        DeserializationTestRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Filter users by role with nullable enum
    /// </summary>
    WithRawResponseTask<IEnumerable<UserResponse>> FilterByRoleAsync(
        FilterByRoleRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Get notification settings which may be null
    /// </summary>
    WithRawResponseTask<NotificationMethod?> GetNotificationSettingsAsync(
        string userId,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Update tags to test array handling
    /// </summary>
    WithRawResponseTask<IEnumerable<string>> UpdateTagsAsync(
        string userId,
        UpdateTagsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Get search results with nullable unions
    /// </summary>
    WithRawResponseTask<IEnumerable<SearchResult>?> GetSearchResultsAsync(
        SearchRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
