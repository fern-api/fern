using System.Text.Json;
using SeedPathParameters.Core;

namespace SeedPathParameters;

public partial class UserClient : IUserClient
{
    private RawClient _client;

    internal UserClient(RawClient client)
    {
        _client = client;
    }

    private async Task<WithRawResponse<User>> GetUserAsyncCore(
        string tenantId,
        string userId,
        GetUsersRequest request,
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
                        "/{0}/user/{1}",
                        ValueConvert.ToPathParameterString(tenantId),
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
                var responseData = JsonUtils.Deserialize<User>(responseBody)!;
                return new WithRawResponse<User>()
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
                throw new SeedPathParametersApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedPathParametersApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    private async Task<WithRawResponse<User>> CreateUserAsyncCore(
        string tenantId,
        User request,
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
                    Path = string.Format(
                        "/{0}/user/",
                        ValueConvert.ToPathParameterString(tenantId)
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
                var responseData = JsonUtils.Deserialize<User>(responseBody)!;
                return new WithRawResponse<User>()
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
                throw new SeedPathParametersApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedPathParametersApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    private async Task<WithRawResponse<User>> UpdateUserAsyncCore(
        string tenantId,
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
                        "/{0}/user/{1}",
                        ValueConvert.ToPathParameterString(tenantId),
                        ValueConvert.ToPathParameterString(userId)
                    ),
                    Body = request.Body,
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
                var responseData = JsonUtils.Deserialize<User>(responseBody)!;
                return new WithRawResponse<User>()
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
                throw new SeedPathParametersApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedPathParametersApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    private async Task<WithRawResponse<IEnumerable<User>>> SearchUsersAsyncCore(
        string tenantId,
        string userId,
        SearchUsersRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _queryBuilder = new SeedPathParameters.Core.QueryStringBuilder.Builder(capacity: 1);
        if (request.Limit != null)
        {
            _queryBuilder.Add("limit", request.Limit);
        }
        var _queryString = _queryBuilder
            .MergeAdditional(options?.AdditionalQueryParameters)
            .Build();
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = string.Format(
                        "/{0}/user/{1}/search",
                        ValueConvert.ToPathParameterString(tenantId),
                        ValueConvert.ToPathParameterString(userId)
                    ),
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
                var responseData = JsonUtils.Deserialize<IEnumerable<User>>(responseBody)!;
                return new WithRawResponse<IEnumerable<User>>()
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
                throw new SeedPathParametersApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedPathParametersApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    private async Task<WithRawResponse<User>> GetUserMetadataAsyncCore(
        string tenantId,
        string userId,
        int version,
        GetUserMetadataRequest request,
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
                        "/{0}/user/{1}/metadata/v{2}",
                        ValueConvert.ToPathParameterString(tenantId),
                        ValueConvert.ToPathParameterString(userId),
                        ValueConvert.ToPathParameterString(version)
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
                var responseData = JsonUtils.Deserialize<User>(responseBody)!;
                return new WithRawResponse<User>()
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
                throw new SeedPathParametersApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedPathParametersApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    private async Task<WithRawResponse<User>> GetUserSpecificsAsyncCore(
        string tenantId,
        string userId,
        int version,
        string thought,
        GetUserSpecificsRequest request,
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
                        "/{0}/user/{1}/specifics/{2}/{3}",
                        ValueConvert.ToPathParameterString(tenantId),
                        ValueConvert.ToPathParameterString(userId),
                        ValueConvert.ToPathParameterString(version),
                        ValueConvert.ToPathParameterString(thought)
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
                var responseData = JsonUtils.Deserialize<User>(responseBody)!;
                return new WithRawResponse<User>()
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
                throw new SeedPathParametersApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedPathParametersApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.User.GetUserAsync("tenant_id", "user_id", new GetUsersRequest());
    /// </code></example>
    public WithRawResponseTask<User> GetUserAsync(
        string tenantId,
        string userId,
        GetUsersRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<User>(
            GetUserAsyncCore(tenantId, userId, request, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.User.CreateUserAsync(
    ///     "tenant_id",
    ///     new User
    ///     {
    ///         Name = "name",
    ///         Tags = new List&lt;string&gt;() { "tags", "tags" },
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<User> CreateUserAsync(
        string tenantId,
        User request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<User>(
            CreateUserAsyncCore(tenantId, request, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.User.UpdateUserAsync(
    ///     "tenant_id",
    ///     "user_id",
    ///     new UpdateUserRequest
    ///     {
    ///         Body = new User
    ///         {
    ///             Name = "name",
    ///             Tags = new List&lt;string&gt;() { "tags", "tags" },
    ///         },
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<User> UpdateUserAsync(
        string tenantId,
        string userId,
        UpdateUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<User>(
            UpdateUserAsyncCore(tenantId, userId, request, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.User.SearchUsersAsync("tenant_id", "user_id", new SearchUsersRequest { Limit = 1 });
    /// </code></example>
    public WithRawResponseTask<IEnumerable<User>> SearchUsersAsync(
        string tenantId,
        string userId,
        SearchUsersRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<IEnumerable<User>>(
            SearchUsersAsyncCore(tenantId, userId, request, options, cancellationToken)
        );
    }

    /// <summary>
    /// Test endpoint with path parameter that has a text prefix (v{version})
    /// </summary>
    /// <example><code>
    /// await client.User.GetUserMetadataAsync("tenant_id", "user_id", 1, new GetUserMetadataRequest());
    /// </code></example>
    public WithRawResponseTask<User> GetUserMetadataAsync(
        string tenantId,
        string userId,
        int version,
        GetUserMetadataRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<User>(
            GetUserMetadataAsyncCore(tenantId, userId, version, request, options, cancellationToken)
        );
    }

    /// <summary>
    /// Test endpoint with path parameters listed in different order than found in path
    /// </summary>
    /// <example><code>
    /// await client.User.GetUserSpecificsAsync(
    ///     "tenant_id",
    ///     "user_id",
    ///     1,
    ///     "thought",
    ///     new GetUserSpecificsRequest()
    /// );
    /// </code></example>
    public WithRawResponseTask<User> GetUserSpecificsAsync(
        string tenantId,
        string userId,
        int version,
        string thought,
        GetUserSpecificsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<User>(
            GetUserSpecificsAsyncCore(
                tenantId,
                userId,
                version,
                thought,
                request,
                options,
                cancellationToken
            )
        );
    }
}
