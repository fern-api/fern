using global::System.Text.Json;
using SeedApi.Core;

namespace SeedApi;

public partial class UserClient : IUserClient
{
    private readonly RawClient _client;

    internal UserClient(RawClient client)
    {
        _client = client;
    }

    private async Task<WithRawResponse<User>> GetuserAsyncCore(
        string tenantId,
        string userId,
        UserGetUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedApi.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    Method = HttpMethod.Get,
                    Path = string.Format(
                        "{0}/user/{1}",
                        ValueConvert.ToPathParameterString(tenantId),
                        ValueConvert.ToPathParameterString(userId)
                    ),
                    Headers = _headers,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
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
                throw new SeedApiApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedApiApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    private async Task<WithRawResponse<User>> UpdateuserAsyncCore(
        string tenantId,
        string userId,
        UserUpdateUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedApi.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    Method = HttpMethodExtensions.Patch,
                    Path = string.Format(
                        "{0}/user/{1}",
                        ValueConvert.ToPathParameterString(tenantId),
                        ValueConvert.ToPathParameterString(userId)
                    ),
                    Body = request.Body,
                    Headers = _headers,
                    ContentType = "application/json",
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
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
                throw new SeedApiApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedApiApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    private async Task<WithRawResponse<User>> CreateuserAsyncCore(
        string tenantId,
        UserCreateUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedApi.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    Method = HttpMethod.Post,
                    Path = string.Format("{0}/user/", ValueConvert.ToPathParameterString(tenantId)),
                    Body = request.Body,
                    Headers = _headers,
                    ContentType = "application/json",
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
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
                throw new SeedApiApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedApiApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    private async Task<WithRawResponse<IEnumerable<User>>> SearchusersAsyncCore(
        string tenantId,
        string userId,
        UserSearchUsersRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _queryString = new SeedApi.Core.QueryStringBuilder.Builder(capacity: 1)
            .Add("limit", request.Limit)
            .MergeAdditional(options?.AdditionalQueryParameters)
            .Build();
        var _headers = await new SeedApi.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    Method = HttpMethod.Get,
                    Path = string.Format(
                        "{0}/user/{1}/search",
                        ValueConvert.ToPathParameterString(tenantId),
                        ValueConvert.ToPathParameterString(userId)
                    ),
                    QueryString = _queryString,
                    Headers = _headers,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
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
                throw new SeedApiApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedApiApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    private async Task<WithRawResponse<User>> GetusermetadataAsyncCore(
        string tenantId,
        string userId,
        int version,
        UserGetUserMetadataRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedApi.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    Method = HttpMethod.Get,
                    Path = string.Format(
                        "{0}/user/{1}/metadata/v{2}",
                        ValueConvert.ToPathParameterString(tenantId),
                        ValueConvert.ToPathParameterString(userId),
                        ValueConvert.ToPathParameterString(version)
                    ),
                    Headers = _headers,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
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
                throw new SeedApiApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedApiApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    private async Task<WithRawResponse<User>> GetuserspecificsAsyncCore(
        string tenantId,
        string userId,
        int version,
        string thought,
        UserGetUserSpecificsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedApi.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    Method = HttpMethod.Get,
                    Path = string.Format(
                        "{0}/user/{1}/specifics/{2}/{3}",
                        ValueConvert.ToPathParameterString(tenantId),
                        ValueConvert.ToPathParameterString(userId),
                        ValueConvert.ToPathParameterString(version),
                        ValueConvert.ToPathParameterString(thought)
                    ),
                    Headers = _headers,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
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
                throw new SeedApiApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedApiApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.User.GetuserAsync("tenant_id", "user_id", new UserGetUserRequest());
    /// </code></example>
    public WithRawResponseTask<User> GetuserAsync(
        string tenantId,
        string userId,
        UserGetUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<User>(
            GetuserAsyncCore(tenantId, userId, request, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.User.UpdateuserAsync(
    ///     "tenant_id",
    ///     "user_id",
    ///     new UserUpdateUserRequest
    ///     {
    ///         Body = new User
    ///         {
    ///             Name = "name",
    ///             Tags = new List&lt;string&gt;() { "tags" },
    ///         },
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<User> UpdateuserAsync(
        string tenantId,
        string userId,
        UserUpdateUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<User>(
            UpdateuserAsyncCore(tenantId, userId, request, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.User.CreateuserAsync(
    ///     "tenant_id",
    ///     new UserCreateUserRequest
    ///     {
    ///         Body = new User
    ///         {
    ///             Name = "name",
    ///             Tags = new List&lt;string&gt;() { "tags" },
    ///         },
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<User> CreateuserAsync(
        string tenantId,
        UserCreateUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<User>(
            CreateuserAsyncCore(tenantId, request, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.User.SearchusersAsync("tenant_id", "user_id", new UserSearchUsersRequest());
    /// </code></example>
    public WithRawResponseTask<IEnumerable<User>> SearchusersAsync(
        string tenantId,
        string userId,
        UserSearchUsersRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<IEnumerable<User>>(
            SearchusersAsyncCore(tenantId, userId, request, options, cancellationToken)
        );
    }

    /// <summary>
    /// Test endpoint with path parameter that has a text prefix (v{version})
    /// </summary>
    /// <example><code>
    /// await client.User.GetusermetadataAsync("tenant_id", "user_id", 1, new UserGetUserMetadataRequest());
    /// </code></example>
    public WithRawResponseTask<User> GetusermetadataAsync(
        string tenantId,
        string userId,
        int version,
        UserGetUserMetadataRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<User>(
            GetusermetadataAsyncCore(tenantId, userId, version, request, options, cancellationToken)
        );
    }

    /// <summary>
    /// Test endpoint with path parameters listed in different order than found in path
    /// </summary>
    /// <example><code>
    /// await client.User.GetuserspecificsAsync(
    ///     "tenant_id",
    ///     "user_id",
    ///     1,
    ///     "thought",
    ///     new UserGetUserSpecificsRequest()
    /// );
    /// </code></example>
    public WithRawResponseTask<User> GetuserspecificsAsync(
        string tenantId,
        string userId,
        int version,
        string thought,
        UserGetUserSpecificsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<User>(
            GetuserspecificsAsyncCore(
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
