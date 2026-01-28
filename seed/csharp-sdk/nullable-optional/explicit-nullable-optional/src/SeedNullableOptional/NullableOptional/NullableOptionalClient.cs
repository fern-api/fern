using System.Text.Json;
using SeedNullableOptional.Core;

namespace SeedNullableOptional;

public partial class NullableOptionalClient : INullableOptionalClient
{
    private RawClient _client;

    internal NullableOptionalClient(RawClient client)
    {
        _client = client;
    }

    private async Task<WithRawResponse<UserResponse>> GetUserAsyncCore(
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
                var responseData = JsonUtils.Deserialize<UserResponse>(responseBody)!;
                return new WithRawResponse<UserResponse>()
                {
                    Data = responseData,
                    RawResponse = new RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
            }
            catch (JsonException e)
            {
                throw new SeedNullableOptionalApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
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

    private async Task<WithRawResponse<UserResponse>> CreateUserAsyncCore(
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
                var responseData = JsonUtils.Deserialize<UserResponse>(responseBody)!;
                return new WithRawResponse<UserResponse>()
                {
                    Data = responseData,
                    RawResponse = new RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
            }
            catch (JsonException e)
            {
                throw new SeedNullableOptionalApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
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

    private async Task<WithRawResponse<UserResponse>> UpdateUserAsyncCore(
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
                var responseData = JsonUtils.Deserialize<UserResponse>(responseBody)!;
                return new WithRawResponse<UserResponse>()
                {
                    Data = responseData,
                    RawResponse = new RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
            }
            catch (JsonException e)
            {
                throw new SeedNullableOptionalApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
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

    private async Task<WithRawResponse<IEnumerable<UserResponse>>> ListUsersAsyncCore(
        ListUsersRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _queryString = new SeedNullableOptional.Core.QueryStringBuilder.Builder(capacity: 4)
            .Add("limit", request.Limit)
            .Add("offset", request.Offset)
            .Add("includeDeleted", request.IncludeDeleted)
            .Add("sortBy", request.SortBy.IsDefined ? request.SortBy.Value : null)
            .MergeAdditional(options?.AdditionalQueryParameters)
            .Build();
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = "/api/users",
                    QueryString = _queryString,
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
                var responseData = JsonUtils.Deserialize<IEnumerable<UserResponse>>(responseBody)!;
                return new WithRawResponse<IEnumerable<UserResponse>>()
                {
                    Data = responseData,
                    RawResponse = new RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
            }
            catch (JsonException e)
            {
                throw new SeedNullableOptionalApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
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

    private async Task<WithRawResponse<IEnumerable<UserResponse>>> SearchUsersAsyncCore(
        SearchUsersRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _queryString = new SeedNullableOptional.Core.QueryStringBuilder.Builder(capacity: 4)
            .Add("query", request.Query)
            .Add("department", request.Department)
            .Add("role", request.Role)
            .Add("isActive", request.IsActive.IsDefined ? request.IsActive.Value : null)
            .MergeAdditional(options?.AdditionalQueryParameters)
            .Build();
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = "/api/users/search",
                    QueryString = _queryString,
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
                var responseData = JsonUtils.Deserialize<IEnumerable<UserResponse>>(responseBody)!;
                return new WithRawResponse<IEnumerable<UserResponse>>()
                {
                    Data = responseData,
                    RawResponse = new RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
            }
            catch (JsonException e)
            {
                throw new SeedNullableOptionalApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
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

    private async Task<WithRawResponse<ComplexProfile>> CreateComplexProfileAsyncCore(
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
                var responseData = JsonUtils.Deserialize<ComplexProfile>(responseBody)!;
                return new WithRawResponse<ComplexProfile>()
                {
                    Data = responseData,
                    RawResponse = new RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
            }
            catch (JsonException e)
            {
                throw new SeedNullableOptionalApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
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

    private async Task<WithRawResponse<ComplexProfile>> GetComplexProfileAsyncCore(
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
                var responseData = JsonUtils.Deserialize<ComplexProfile>(responseBody)!;
                return new WithRawResponse<ComplexProfile>()
                {
                    Data = responseData,
                    RawResponse = new RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
            }
            catch (JsonException e)
            {
                throw new SeedNullableOptionalApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
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

    private async Task<WithRawResponse<ComplexProfile>> UpdateComplexProfileAsyncCore(
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
                var responseData = JsonUtils.Deserialize<ComplexProfile>(responseBody)!;
                return new WithRawResponse<ComplexProfile>()
                {
                    Data = responseData,
                    RawResponse = new RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
            }
            catch (JsonException e)
            {
                throw new SeedNullableOptionalApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
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

    private async Task<WithRawResponse<DeserializationTestResponse>> TestDeserializationAsyncCore(
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
                var responseData = JsonUtils.Deserialize<DeserializationTestResponse>(
                    responseBody
                )!;
                return new WithRawResponse<DeserializationTestResponse>()
                {
                    Data = responseData,
                    RawResponse = new RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
            }
            catch (JsonException e)
            {
                throw new SeedNullableOptionalApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
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

    private async Task<WithRawResponse<IEnumerable<UserResponse>>> FilterByRoleAsyncCore(
        FilterByRoleRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _queryString = new SeedNullableOptional.Core.QueryStringBuilder.Builder(capacity: 3)
            .Add("role", request.Role)
            .Add("status", request.Status)
            .Add(
                "secondaryRole",
                request.SecondaryRole.IsDefined ? request.SecondaryRole.Value : null
            )
            .MergeAdditional(options?.AdditionalQueryParameters)
            .Build();
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = "/api/users/filter",
                    QueryString = _queryString,
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
                var responseData = JsonUtils.Deserialize<IEnumerable<UserResponse>>(responseBody)!;
                return new WithRawResponse<IEnumerable<UserResponse>>()
                {
                    Data = responseData,
                    RawResponse = new RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
            }
            catch (JsonException e)
            {
                throw new SeedNullableOptionalApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
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

    private async Task<WithRawResponse<NotificationMethod?>> GetNotificationSettingsAsyncCore(
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
                var responseData = JsonUtils.Deserialize<NotificationMethod?>(responseBody)!;
                return new WithRawResponse<NotificationMethod?>()
                {
                    Data = responseData,
                    RawResponse = new RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
            }
            catch (JsonException e)
            {
                throw new SeedNullableOptionalApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
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

    private async Task<WithRawResponse<IEnumerable<string>>> UpdateTagsAsyncCore(
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
                var responseData = JsonUtils.Deserialize<IEnumerable<string>>(responseBody)!;
                return new WithRawResponse<IEnumerable<string>>()
                {
                    Data = responseData,
                    RawResponse = new RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
            }
            catch (JsonException e)
            {
                throw new SeedNullableOptionalApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
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

    private async Task<WithRawResponse<IEnumerable<SearchResult>?>> GetSearchResultsAsyncCore(
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
                var responseData = JsonUtils.Deserialize<IEnumerable<SearchResult>?>(responseBody)!;
                return new WithRawResponse<IEnumerable<SearchResult>?>()
                {
                    Data = responseData,
                    RawResponse = new RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
            }
            catch (JsonException e)
            {
                throw new SeedNullableOptionalApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
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
    /// Get a user by ID
    /// </summary>
    /// <example><code>
    /// await client.NullableOptional.GetUserAsync("userId");
    /// </code></example>
    public WithRawResponseTask<UserResponse> GetUserAsync(
        string userId,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<UserResponse>(
            GetUserAsyncCore(userId, options, cancellationToken)
        );
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
    public WithRawResponseTask<UserResponse> CreateUserAsync(
        CreateUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<UserResponse>(
            CreateUserAsyncCore(request, options, cancellationToken)
        );
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
    public WithRawResponseTask<UserResponse> UpdateUserAsync(
        string userId,
        UpdateUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<UserResponse>(
            UpdateUserAsyncCore(userId, request, options, cancellationToken)
        );
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
    public WithRawResponseTask<IEnumerable<UserResponse>> ListUsersAsync(
        ListUsersRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<IEnumerable<UserResponse>>(
            ListUsersAsyncCore(request, options, cancellationToken)
        );
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
    public WithRawResponseTask<IEnumerable<UserResponse>> SearchUsersAsync(
        SearchUsersRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<IEnumerable<UserResponse>>(
            SearchUsersAsyncCore(request, options, cancellationToken)
        );
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
    ///         NullableListOfNullables = new List&lt;string?&gt;()
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
    public WithRawResponseTask<ComplexProfile> CreateComplexProfileAsync(
        ComplexProfile request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<ComplexProfile>(
            CreateComplexProfileAsyncCore(request, options, cancellationToken)
        );
    }

    /// <summary>
    /// Get a complex profile by ID
    /// </summary>
    /// <example><code>
    /// await client.NullableOptional.GetComplexProfileAsync("profileId");
    /// </code></example>
    public WithRawResponseTask<ComplexProfile> GetComplexProfileAsync(
        string profileId,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<ComplexProfile>(
            GetComplexProfileAsyncCore(profileId, options, cancellationToken)
        );
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
    public WithRawResponseTask<ComplexProfile> UpdateComplexProfileAsync(
        string profileId,
        UpdateComplexProfileRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<ComplexProfile>(
            UpdateComplexProfileAsyncCore(profileId, request, options, cancellationToken)
        );
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
    public WithRawResponseTask<DeserializationTestResponse> TestDeserializationAsync(
        DeserializationTestRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<DeserializationTestResponse>(
            TestDeserializationAsyncCore(request, options, cancellationToken)
        );
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
    public WithRawResponseTask<IEnumerable<UserResponse>> FilterByRoleAsync(
        FilterByRoleRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<IEnumerable<UserResponse>>(
            FilterByRoleAsyncCore(request, options, cancellationToken)
        );
    }

    /// <summary>
    /// Get notification settings which may be null
    /// </summary>
    /// <example><code>
    /// await client.NullableOptional.GetNotificationSettingsAsync("userId");
    /// </code></example>
    public WithRawResponseTask<NotificationMethod?> GetNotificationSettingsAsync(
        string userId,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<NotificationMethod?>(
            GetNotificationSettingsAsyncCore(userId, options, cancellationToken)
        );
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
    public WithRawResponseTask<IEnumerable<string>> UpdateTagsAsync(
        string userId,
        UpdateTagsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<IEnumerable<string>>(
            UpdateTagsAsyncCore(userId, request, options, cancellationToken)
        );
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
    public WithRawResponseTask<IEnumerable<SearchResult>?> GetSearchResultsAsync(
        SearchRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<IEnumerable<SearchResult>?>(
            GetSearchResultsAsyncCore(request, options, cancellationToken)
        );
    }
}
