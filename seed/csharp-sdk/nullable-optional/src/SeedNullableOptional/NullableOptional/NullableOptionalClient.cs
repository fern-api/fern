using System.Text.Json;
using SeedNullableOptional.Core;

namespace SeedNullableOptional;

public partial class NullableOptionalClient
{
    private RawClient _client;

    internal NullableOptionalClient(RawClient client)
    {
        _client = client;
    }

    /// <summary>
    /// Get a user by ID
    /// </summary>
    /// <example><code>
    /// await client.NullableOptional.GetUserAsync("userId");
    /// </code></example>
    public async Task<UserResponse> GetUserAsync(
        string userId,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = string.Format(
                        "/api/users/{0}",
                        ValueConvert.ToPathParameterString(userId)
                    ),
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            try
            {
                return JsonUtils.Deserialize<UserResponse>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedNullableOptionalException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedNullableOptionalApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <summary>
    /// Create a new user
    /// </summary>
    /// <example><code>
    /// await client.NullableOptional.CreateUserAsync(
    ///     new CreateUserRequest
    ///     {
    ///         Username = "username",
    ///         Email = "email",
    ///         Phone = "phone",
    ///         Address = new Address
    ///         {
    ///             Street = "street",
    ///             City = "city",
    ///             State = "state",
    ///             ZipCode = "zipCode",
    ///             Country = "country",
    ///             BuildingId = "buildingId",
    ///             TenantId = "tenantId",
    ///         },
    ///     }
    /// );
    /// </code></example>
    public async Task<UserResponse> CreateUserAsync(
        CreateUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = "/api/users",
                    Body = request,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            try
            {
                return JsonUtils.Deserialize<UserResponse>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedNullableOptionalException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedNullableOptionalApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <summary>
    /// Update a user (partial update)
    /// </summary>
    /// <example><code>
    /// await client.NullableOptional.UpdateUserAsync(
    ///     "userId",
    ///     new UpdateUserRequest
    ///     {
    ///         Username = "username",
    ///         Email = "email",
    ///         Phone = "phone",
    ///         Address = new Address
    ///         {
    ///             Street = "street",
    ///             City = "city",
    ///             State = "state",
    ///             ZipCode = "zipCode",
    ///             Country = "country",
    ///             BuildingId = "buildingId",
    ///             TenantId = "tenantId",
    ///         },
    ///     }
    /// );
    /// </code></example>
    public async Task<UserResponse> UpdateUserAsync(
        string userId,
        UpdateUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethodExtensions.Patch,
                    Path = string.Format(
                        "/api/users/{0}",
                        ValueConvert.ToPathParameterString(userId)
                    ),
                    Body = request,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            try
            {
                return JsonUtils.Deserialize<UserResponse>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedNullableOptionalException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedNullableOptionalApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <summary>
    /// List all users
    /// </summary>
    /// <example><code>
    /// await client.NullableOptional.ListUsersAsync(
    ///     new ListUsersRequest
    ///     {
    ///         Limit = 1,
    ///         Offset = 1,
    ///         IncludeDeleted = true,
    ///         SortBy = "sortBy",
    ///     }
    /// );
    /// </code></example>
    public async Task<IEnumerable<UserResponse>> ListUsersAsync(
        ListUsersRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _query = new Dictionary<string, object>();
        if (request.Limit != null)
        {
            _query["limit"] = request.Limit.Value.ToString();
        }
        if (request.Offset != null)
        {
            _query["offset"] = request.Offset.Value.ToString();
        }
        if (request.IncludeDeleted != null)
        {
            _query["includeDeleted"] = JsonUtils.Serialize(request.IncludeDeleted.Value);
        }
        if (request.SortBy != null)
        {
            _query["sortBy"] = request.SortBy;
        }
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = "/api/users",
                    Query = _query,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            try
            {
                return JsonUtils.Deserialize<IEnumerable<UserResponse>>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedNullableOptionalException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedNullableOptionalApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <summary>
    /// Search users
    /// </summary>
    /// <example><code>
    /// await client.NullableOptional.SearchUsersAsync(
    ///     new SearchUsersRequest
    ///     {
    ///         Query = "query",
    ///         Department = "department",
    ///         Role = "role",
    ///         IsActive = true,
    ///     }
    /// );
    /// </code></example>
    public async Task<IEnumerable<UserResponse>> SearchUsersAsync(
        SearchUsersRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _query = new Dictionary<string, object>();
        _query["query"] = request.Query;
        if (request.Department != null)
        {
            _query["department"] = request.Department;
        }
        if (request.Role != null)
        {
            _query["role"] = request.Role;
        }
        if (request.IsActive != null)
        {
            _query["isActive"] = JsonUtils.Serialize(request.IsActive.Value);
        }
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = "/api/users/search",
                    Query = _query,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            try
            {
                return JsonUtils.Deserialize<IEnumerable<UserResponse>>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedNullableOptionalException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedNullableOptionalApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <summary>
    /// Create a complex profile to test nullable enums and unions
    /// </summary>
    /// <example><code>
    /// await client.NullableOptional.CreateComplexProfileAsync(
    ///     new ComplexProfile
    ///     {
    ///         Id = "id",
    ///         NullableRole = UserRole.Admin,
    ///         OptionalRole = UserRole.Admin,
    ///         OptionalNullableRole = UserRole.Admin,
    ///         NullableStatus = UserStatus.Active,
    ///         OptionalStatus = UserStatus.Active,
    ///         OptionalNullableStatus = UserStatus.Active,
    ///         NullableNotification = new NotificationMethod(
    ///             new NotificationMethod.Email(
    ///                 new EmailNotification
    ///                 {
    ///                     EmailAddress = "emailAddress",
    ///                     Subject = "subject",
    ///                     HtmlContent = "htmlContent",
    ///                 }
    ///             )
    ///         ),
    ///         OptionalNotification = new NotificationMethod(
    ///             new NotificationMethod.Email(
    ///                 new EmailNotification
    ///                 {
    ///                     EmailAddress = "emailAddress",
    ///                     Subject = "subject",
    ///                     HtmlContent = "htmlContent",
    ///                 }
    ///             )
    ///         ),
    ///         OptionalNullableNotification = new NotificationMethod(
    ///             new NotificationMethod.Email(
    ///                 new EmailNotification
    ///                 {
    ///                     EmailAddress = "emailAddress",
    ///                     Subject = "subject",
    ///                     HtmlContent = "htmlContent",
    ///                 }
    ///             )
    ///         ),
    ///         NullableSearchResult = new SearchResult(
    ///             new SearchResult.User(
    ///                 new UserResponse
    ///                 {
    ///                     Id = "id",
    ///                     Username = "username",
    ///                     Email = "email",
    ///                     Phone = "phone",
    ///                     CreatedAt = new DateTime(2024, 01, 15, 09, 30, 00, 000),
    ///                     UpdatedAt = new DateTime(2024, 01, 15, 09, 30, 00, 000),
    ///                     Address = new Address
    ///                     {
    ///                         Street = "street",
    ///                         City = "city",
    ///                         State = "state",
    ///                         ZipCode = "zipCode",
    ///                         Country = "country",
    ///                         BuildingId = "buildingId",
    ///                         TenantId = "tenantId",
    ///                     },
    ///                 }
    ///             )
    ///         ),
    ///         OptionalSearchResult = new SearchResult(
    ///             new SearchResult.User(
    ///                 new UserResponse
    ///                 {
    ///                     Id = "id",
    ///                     Username = "username",
    ///                     Email = "email",
    ///                     Phone = "phone",
    ///                     CreatedAt = new DateTime(2024, 01, 15, 09, 30, 00, 000),
    ///                     UpdatedAt = new DateTime(2024, 01, 15, 09, 30, 00, 000),
    ///                     Address = new Address
    ///                     {
    ///                         Street = "street",
    ///                         City = "city",
    ///                         State = "state",
    ///                         ZipCode = "zipCode",
    ///                         Country = "country",
    ///                         BuildingId = "buildingId",
    ///                         TenantId = "tenantId",
    ///                     },
    ///                 }
    ///             )
    ///         ),
    ///         NullableArray = new List&lt;string&gt;() { "nullableArray", "nullableArray" },
    ///         OptionalArray = new List&lt;string&gt;() { "optionalArray", "optionalArray" },
    ///         OptionalNullableArray = new List&lt;string&gt;()
    ///         {
    ///             "optionalNullableArray",
    ///             "optionalNullableArray",
    ///         },
    ///         NullableListOfNullables = new List&lt;string&gt;()
    ///         {
    ///             "nullableListOfNullables",
    ///             "nullableListOfNullables",
    ///         },
    ///         NullableMapOfNullables = new Dictionary&lt;string, Address?&gt;()
    ///         {
    ///             {
    ///                 "nullableMapOfNullables",
    ///                 new Address
    ///                 {
    ///                     Street = "street",
    ///                     City = "city",
    ///                     State = "state",
    ///                     ZipCode = "zipCode",
    ///                     Country = "country",
    ///                     BuildingId = "buildingId",
    ///                     TenantId = "tenantId",
    ///                 }
    ///             },
    ///         },
    ///         NullableListOfUnions = new List&lt;NotificationMethod&gt;()
    ///         {
    ///             new NotificationMethod(
    ///                 new NotificationMethod.Email(
    ///                     new EmailNotification
    ///                     {
    ///                         EmailAddress = "emailAddress",
    ///                         Subject = "subject",
    ///                         HtmlContent = "htmlContent",
    ///                     }
    ///                 )
    ///             ),
    ///             new NotificationMethod(
    ///                 new NotificationMethod.Email(
    ///                     new EmailNotification
    ///                     {
    ///                         EmailAddress = "emailAddress",
    ///                         Subject = "subject",
    ///                         HtmlContent = "htmlContent",
    ///                     }
    ///                 )
    ///             ),
    ///         },
    ///         OptionalMapOfEnums = new Dictionary&lt;string, UserRole&gt;()
    ///         {
    ///             { "optionalMapOfEnums", UserRole.Admin },
    ///         },
    ///     }
    /// );
    /// </code></example>
    public async Task<ComplexProfile> CreateComplexProfileAsync(
        ComplexProfile request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = "/api/profiles/complex",
                    Body = request,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            try
            {
                return JsonUtils.Deserialize<ComplexProfile>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedNullableOptionalException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedNullableOptionalApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <summary>
    /// Get a complex profile by ID
    /// </summary>
    /// <example><code>
    /// await client.NullableOptional.GetComplexProfileAsync("profileId");
    /// </code></example>
    public async Task<ComplexProfile> GetComplexProfileAsync(
        string profileId,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = string.Format(
                        "/api/profiles/complex/{0}",
                        ValueConvert.ToPathParameterString(profileId)
                    ),
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            try
            {
                return JsonUtils.Deserialize<ComplexProfile>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedNullableOptionalException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedNullableOptionalApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <summary>
    /// Update complex profile to test nullable field updates
    /// </summary>
    /// <example><code>
    /// await client.NullableOptional.UpdateComplexProfileAsync(
    ///     "profileId",
    ///     new UpdateComplexProfileRequest
    ///     {
    ///         NullableRole = UserRole.Admin,
    ///         NullableStatus = UserStatus.Active,
    ///         NullableNotification = new NotificationMethod(
    ///             new NotificationMethod.Email(
    ///                 new EmailNotification
    ///                 {
    ///                     EmailAddress = "emailAddress",
    ///                     Subject = "subject",
    ///                     HtmlContent = "htmlContent",
    ///                 }
    ///             )
    ///         ),
    ///         NullableSearchResult = new SearchResult(
    ///             new SearchResult.User(
    ///                 new UserResponse
    ///                 {
    ///                     Id = "id",
    ///                     Username = "username",
    ///                     Email = "email",
    ///                     Phone = "phone",
    ///                     CreatedAt = new DateTime(2024, 01, 15, 09, 30, 00, 000),
    ///                     UpdatedAt = new DateTime(2024, 01, 15, 09, 30, 00, 000),
    ///                     Address = new Address
    ///                     {
    ///                         Street = "street",
    ///                         City = "city",
    ///                         State = "state",
    ///                         ZipCode = "zipCode",
    ///                         Country = "country",
    ///                         BuildingId = "buildingId",
    ///                         TenantId = "tenantId",
    ///                     },
    ///                 }
    ///             )
    ///         ),
    ///         NullableArray = new List&lt;string&gt;() { "nullableArray", "nullableArray" },
    ///     }
    /// );
    /// </code></example>
    public async Task<ComplexProfile> UpdateComplexProfileAsync(
        string profileId,
        UpdateComplexProfileRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethodExtensions.Patch,
                    Path = string.Format(
                        "/api/profiles/complex/{0}",
                        ValueConvert.ToPathParameterString(profileId)
                    ),
                    Body = request,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            try
            {
                return JsonUtils.Deserialize<ComplexProfile>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedNullableOptionalException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedNullableOptionalApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <summary>
    /// Test endpoint for validating null deserialization
    /// </summary>
    /// <example><code>
    /// await client.NullableOptional.TestDeserializationAsync(
    ///     new DeserializationTestRequest
    ///     {
    ///         RequiredString = "requiredString",
    ///         NullableString = "nullableString",
    ///         OptionalString = "optionalString",
    ///         OptionalNullableString = "optionalNullableString",
    ///         NullableEnum = UserRole.Admin,
    ///         OptionalEnum = UserStatus.Active,
    ///         NullableUnion = new NotificationMethod(
    ///             new NotificationMethod.Email(
    ///                 new EmailNotification
    ///                 {
    ///                     EmailAddress = "emailAddress",
    ///                     Subject = "subject",
    ///                     HtmlContent = "htmlContent",
    ///                 }
    ///             )
    ///         ),
    ///         OptionalUnion = new SearchResult(
    ///             new SearchResult.User(
    ///                 new UserResponse
    ///                 {
    ///                     Id = "id",
    ///                     Username = "username",
    ///                     Email = "email",
    ///                     Phone = "phone",
    ///                     CreatedAt = new DateTime(2024, 01, 15, 09, 30, 00, 000),
    ///                     UpdatedAt = new DateTime(2024, 01, 15, 09, 30, 00, 000),
    ///                     Address = new Address
    ///                     {
    ///                         Street = "street",
    ///                         City = "city",
    ///                         State = "state",
    ///                         ZipCode = "zipCode",
    ///                         Country = "country",
    ///                         BuildingId = "buildingId",
    ///                         TenantId = "tenantId",
    ///                     },
    ///                 }
    ///             )
    ///         ),
    ///         NullableList = new List&lt;string&gt;() { "nullableList", "nullableList" },
    ///         NullableMap = new Dictionary&lt;string, int&gt;() { { "nullableMap", 1 } },
    ///         NullableObject = new Address
    ///         {
    ///             Street = "street",
    ///             City = "city",
    ///             State = "state",
    ///             ZipCode = "zipCode",
    ///             Country = "country",
    ///             BuildingId = "buildingId",
    ///             TenantId = "tenantId",
    ///         },
    ///         OptionalObject = new Organization
    ///         {
    ///             Id = "id",
    ///             Name = "name",
    ///             Domain = "domain",
    ///             EmployeeCount = 1,
    ///         },
    ///     }
    /// );
    /// </code></example>
    public async Task<DeserializationTestResponse> TestDeserializationAsync(
        DeserializationTestRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = "/api/test/deserialization",
                    Body = request,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            try
            {
                return JsonUtils.Deserialize<DeserializationTestResponse>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedNullableOptionalException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedNullableOptionalApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <summary>
    /// Filter users by role with nullable enum
    /// </summary>
    /// <example><code>
    /// await client.NullableOptional.FilterByRoleAsync(
    ///     new FilterByRoleRequest
    ///     {
    ///         Role = UserRole.Admin,
    ///         Status = UserStatus.Active,
    ///         SecondaryRole = UserRole.Admin,
    ///     }
    /// );
    /// </code></example>
    public async Task<IEnumerable<UserResponse>> FilterByRoleAsync(
        FilterByRoleRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _query = new Dictionary<string, object>();
        if (request.Role != null)
        {
            _query["role"] = request.Role.Value.ToString();
        }
        if (request.Status != null)
        {
            _query["status"] = request.Status.Value.Stringify();
        }
        if (request.SecondaryRole != null)
        {
            _query["secondaryRole"] = request.SecondaryRole.Value.ToString();
        }
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = "/api/users/filter",
                    Query = _query,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            try
            {
                return JsonUtils.Deserialize<IEnumerable<UserResponse>>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedNullableOptionalException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedNullableOptionalApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <summary>
    /// Get notification settings which may be null
    /// </summary>
    /// <example><code>
    /// await client.NullableOptional.GetNotificationSettingsAsync("userId");
    /// </code></example>
    public async Task<NotificationMethod?> GetNotificationSettingsAsync(
        string userId,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = string.Format(
                        "/api/users/{0}/notifications",
                        ValueConvert.ToPathParameterString(userId)
                    ),
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            try
            {
                return JsonUtils.Deserialize<NotificationMethod?>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedNullableOptionalException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedNullableOptionalApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <summary>
    /// Update tags to test array handling
    /// </summary>
    /// <example><code>
    /// await client.NullableOptional.UpdateTagsAsync(
    ///     "userId",
    ///     new UpdateTagsRequest
    ///     {
    ///         Tags = new List&lt;string&gt;() { "tags", "tags" },
    ///         Categories = new List&lt;string&gt;() { "categories", "categories" },
    ///         Labels = new List&lt;string&gt;() { "labels", "labels" },
    ///     }
    /// );
    /// </code></example>
    public async Task<IEnumerable<string>> UpdateTagsAsync(
        string userId,
        UpdateTagsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Put,
                    Path = string.Format(
                        "/api/users/{0}/tags",
                        ValueConvert.ToPathParameterString(userId)
                    ),
                    Body = request,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            try
            {
                return JsonUtils.Deserialize<IEnumerable<string>>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedNullableOptionalException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedNullableOptionalApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <summary>
    /// Get search results with nullable unions
    /// </summary>
    /// <example><code>
    /// await client.NullableOptional.GetSearchResultsAsync(
    ///     new SearchRequest
    ///     {
    ///         Query = "query",
    ///         Filters = new Dictionary&lt;string, string?&gt;() { { "filters", "filters" } },
    ///         IncludeTypes = new List&lt;string&gt;() { "includeTypes", "includeTypes" },
    ///     }
    /// );
    /// </code></example>
    public async Task<IEnumerable<SearchResult>?> GetSearchResultsAsync(
        SearchRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = "/api/search",
                    Body = request,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            try
            {
                return JsonUtils.Deserialize<IEnumerable<SearchResult>?>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedNullableOptionalException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedNullableOptionalApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }
}
