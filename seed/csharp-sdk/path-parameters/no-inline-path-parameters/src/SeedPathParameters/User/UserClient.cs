using System.Text.Json;
using SeedPathParameters.Core;

namespace SeedPathParameters;

public partial class UserClient : IUserClient
{
    private RawClient _client;

    internal UserClient(RawClient client)
    {
        _client = client;
        Raw = new WithRawResponseClient(_client);
    }

    public UserClient.WithRawResponseClient Raw { get; }

    /// <example><code>
    /// await client.User.GetUserAsync("tenant_id", "user_id", new GetUsersRequest());
    /// </code></example>
    public async Task<User> GetUserAsync(
        string tenantId,
        string userId,
        GetUsersRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await Raw.GetUserAsync(
            tenantId,
            userId,
            request,
            options,
            cancellationToken
        );
        return response.Data;
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
    public async Task<User> CreateUserAsync(
        string tenantId,
        User request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await Raw.CreateUserAsync(tenantId, request, options, cancellationToken);
        return response.Data;
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
    public async Task<User> UpdateUserAsync(
        string tenantId,
        string userId,
        UpdateUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await Raw.UpdateUserAsync(
            tenantId,
            userId,
            request,
            options,
            cancellationToken
        );
        return response.Data;
    }

    /// <example><code>
    /// await client.User.SearchUsersAsync("tenant_id", "user_id", new SearchUsersRequest { Limit = 1 });
    /// </code></example>
    public async Task<IEnumerable<User>> SearchUsersAsync(
        string tenantId,
        string userId,
        SearchUsersRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await Raw.SearchUsersAsync(
            tenantId,
            userId,
            request,
            options,
            cancellationToken
        );
        return response.Data;
    }

    /// <summary>
    /// Test endpoint with path parameter that has a text prefix (v{version})
    /// </summary>
    /// <example><code>
    /// await client.User.GetUserMetadataAsync("tenant_id", "user_id", 1, new GetUserMetadataRequest());
    /// </code></example>
    public async Task<User> GetUserMetadataAsync(
        string tenantId,
        string userId,
        int version,
        GetUserMetadataRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await Raw.GetUserMetadataAsync(
            tenantId,
            userId,
            version,
            request,
            options,
            cancellationToken
        );
        return response.Data;
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
    public async Task<User> GetUserSpecificsAsync(
        string tenantId,
        string userId,
        int version,
        string thought,
        GetUserSpecificsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await Raw.GetUserSpecificsAsync(
            tenantId,
            userId,
            version,
            thought,
            request,
            options,
            cancellationToken
        );
        return response.Data;
    }

    public partial class WithRawResponseClient
    {
        private readonly RawClient _client;

        internal WithRawResponseClient(RawClient client)
        {
            _client = client;
        }

        public async Task<WithRawResponse<User>> GetUserAsync(
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
                    var data = JsonUtils.Deserialize<User>(responseBody)!;
                    return new WithRawResponse<User>
                    {
                        Data = data,
                        RawResponse = new RawResponse
                        {
                            StatusCode = (global::System.Net.HttpStatusCode)response.StatusCode,
                            Url = response.Raw.RequestMessage?.RequestUri!,
                            Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                        },
                    };
                }
                catch (JsonException e)
                {
                    throw new SeedPathParametersException("Failed to deserialize response", e);
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

        public async Task<WithRawResponse<User>> CreateUserAsync(
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
                    var data = JsonUtils.Deserialize<User>(responseBody)!;
                    return new WithRawResponse<User>
                    {
                        Data = data,
                        RawResponse = new RawResponse
                        {
                            StatusCode = (global::System.Net.HttpStatusCode)response.StatusCode,
                            Url = response.Raw.RequestMessage?.RequestUri!,
                            Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                        },
                    };
                }
                catch (JsonException e)
                {
                    throw new SeedPathParametersException("Failed to deserialize response", e);
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

        public async Task<WithRawResponse<User>> UpdateUserAsync(
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
                    var data = JsonUtils.Deserialize<User>(responseBody)!;
                    return new WithRawResponse<User>
                    {
                        Data = data,
                        RawResponse = new RawResponse
                        {
                            StatusCode = (global::System.Net.HttpStatusCode)response.StatusCode,
                            Url = response.Raw.RequestMessage?.RequestUri!,
                            Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                        },
                    };
                }
                catch (JsonException e)
                {
                    throw new SeedPathParametersException("Failed to deserialize response", e);
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

        public async Task<WithRawResponse<IEnumerable<User>>> SearchUsersAsync(
            string tenantId,
            string userId,
            SearchUsersRequest request,
            RequestOptions? options = null,
            CancellationToken cancellationToken = default
        )
        {
            var _query = new Dictionary<string, object>();
            if (request.Limit != null)
            {
                _query["limit"] = request.Limit.Value.ToString();
            }
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
                    var data = JsonUtils.Deserialize<IEnumerable<User>>(responseBody)!;
                    return new WithRawResponse<IEnumerable<User>>
                    {
                        Data = data,
                        RawResponse = new RawResponse
                        {
                            StatusCode = (global::System.Net.HttpStatusCode)response.StatusCode,
                            Url = response.Raw.RequestMessage?.RequestUri!,
                            Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                        },
                    };
                }
                catch (JsonException e)
                {
                    throw new SeedPathParametersException("Failed to deserialize response", e);
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

        /// <summary>
        /// Test endpoint with path parameter that has a text prefix (v{version})
        /// </summary>
        public async Task<WithRawResponse<User>> GetUserMetadataAsync(
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
                    var data = JsonUtils.Deserialize<User>(responseBody)!;
                    return new WithRawResponse<User>
                    {
                        Data = data,
                        RawResponse = new RawResponse
                        {
                            StatusCode = (global::System.Net.HttpStatusCode)response.StatusCode,
                            Url = response.Raw.RequestMessage?.RequestUri!,
                            Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                        },
                    };
                }
                catch (JsonException e)
                {
                    throw new SeedPathParametersException("Failed to deserialize response", e);
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

        /// <summary>
        /// Test endpoint with path parameters listed in different order than found in path
        /// </summary>
        public async Task<WithRawResponse<User>> GetUserSpecificsAsync(
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
                    var data = JsonUtils.Deserialize<User>(responseBody)!;
                    return new WithRawResponse<User>
                    {
                        Data = data,
                        RawResponse = new RawResponse
                        {
                            StatusCode = (global::System.Net.HttpStatusCode)response.StatusCode,
                            Url = response.Raw.RequestMessage?.RequestUri!,
                            Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                        },
                    };
                }
                catch (JsonException e)
                {
                    throw new SeedPathParametersException("Failed to deserialize response", e);
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
    }
}
