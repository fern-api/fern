using OneOf;

namespace SeedApi;

public partial interface INullableoptionalClient
{
    /// <summary>
    /// Get a user by ID
    /// </summary>
    WithRawResponseTask<UserResponse> GetuserAsync(
        NullableOptionalGetUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Update a user (partial update)
    /// </summary>
    WithRawResponseTask<UserResponse> UpdateuserAsync(
        UpdateUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// List all users
    /// </summary>
    WithRawResponseTask<IEnumerable<UserResponse>> ListusersAsync(
        NullableOptionalListUsersRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Create a new user
    /// </summary>
    WithRawResponseTask<UserResponse> CreateuserAsync(
        CreateUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Search users
    /// </summary>
    WithRawResponseTask<IEnumerable<UserResponse>> SearchusersAsync(
        NullableOptionalSearchUsersRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Create a complex profile to test nullable enums and unions
    /// </summary>
    WithRawResponseTask<ComplexProfile> CreatecomplexprofileAsync(
        ComplexProfile request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Get a complex profile by ID
    /// </summary>
    WithRawResponseTask<ComplexProfile> GetcomplexprofileAsync(
        NullableOptionalGetComplexProfileRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Update complex profile to test nullable field updates
    /// </summary>
    WithRawResponseTask<ComplexProfile> UpdatecomplexprofileAsync(
        NullableOptionalUpdateComplexProfileRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Test endpoint for validating null deserialization
    /// </summary>
    WithRawResponseTask<DeserializationTestResponse> TestdeserializationAsync(
        DeserializationTestRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Filter users by role with nullable enum
    /// </summary>
    WithRawResponseTask<IEnumerable<UserResponse>> FilterbyroleAsync(
        NullableOptionalFilterByRoleRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Get notification settings which may be null
    /// </summary>
    WithRawResponseTask<
        OneOf<NotificationMethodZero, NotificationMethodOne, NotificationMethodTwo>
    > GetnotificationsettingsAsync(
        NullableOptionalGetNotificationSettingsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Update tags to test array handling
    /// </summary>
    WithRawResponseTask<IEnumerable<string>> UpdatetagsAsync(
        NullableOptionalUpdateTagsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Get search results with nullable unions
    /// </summary>
    WithRawResponseTask<IEnumerable<
        OneOf<SearchResultZero, SearchResultOne, SearchResultTwo>
    >?> GetsearchresultsAsync(
        NullableOptionalGetSearchResultsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
