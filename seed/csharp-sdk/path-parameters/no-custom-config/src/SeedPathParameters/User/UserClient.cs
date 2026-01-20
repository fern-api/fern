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
    /// await client.User.GetUserAsync(new GetUsersRequest { TenantId = "tenant_id", UserId = "user_id" });
    /// </code></example>
    public async Task<User> GetUserAsync(
        GetUsersRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await Raw.GetUserAsync(request, options, cancellationToken);
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
    ///     new UpdateUserRequest
    ///     {
    ///         TenantId = "tenant_id",
    ///         UserId = "user_id",
    ///         Body = new User
    ///         {
    ///             Name = "name",
    ///             Tags = new List&lt;string&gt;() { "tags", "tags" },
    ///         },
    ///     }
    /// );
    /// </code></example>
    public async Task<User> UpdateUserAsync(
        UpdateUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await Raw.UpdateUserAsync(request, options, cancellationToken);
        return response.Data;
    }

    /// <example><code>
    /// await client.User.SearchUsersAsync(
    ///     new SearchUsersRequest
    ///     {
    ///         TenantId = "tenant_id",
    ///         UserId = "user_id",
    ///         Limit = 1,
    ///     }
    /// );
    /// </code></example>
    public async Task<IEnumerable<User>> SearchUsersAsync(
        SearchUsersRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await Raw.SearchUsersAsync(request, options, cancellationToken);
        return response.Data;
    }

    /// <summary>
    /// Test endpoint with path parameter that has a text prefix (v{version})
    /// </summary>
    /// <example><code>
    /// await client.User.GetUserMetadataAsync(
    ///     new GetUserMetadataRequest
    ///     {
    ///         TenantId = "tenant_id",
    ///         UserId = "user_id",
    ///         Version = 1,
    ///     }
    /// );
    /// </code></example>
    public async Task<User> GetUserMetadataAsync(
        GetUserMetadataRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await Raw.GetUserMetadataAsync(request, options, cancellationToken);
        return response.Data;
    }

    /// <summary>
    /// Test endpoint with path parameters listed in different order than found in path
    /// </summary>
    /// <example><code>
    /// await client.User.GetUserSpecificsAsync(
    ///     new GetUserSpecificsRequest
    ///     {
    ///         TenantId = "tenant_id",
    ///         UserId = "user_id",
    ///         Version = 1,
    ///         Thought = "thought",
    ///     }
    /// );
    /// </code></example>
    public async Task<User> GetUserSpecificsAsync(
        GetUserSpecificsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await Raw.GetUserSpecificsAsync(request, options, cancellationToken);
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
                            ValueConvert.ToPathParameterString(request.TenantId),
                            ValueConvert.ToPathParameterString(request.UserId)
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
                            ValueConvert.ToPathParameterString(request.TenantId),
                            ValueConvert.ToPathParameterString(request.UserId)
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
                            ValueConvert.ToPathParameterString(request.TenantId),
                            ValueConvert.ToPathParameterString(request.UserId)
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
                            ValueConvert.ToPathParameterString(request.TenantId),
                            ValueConvert.ToPathParameterString(request.UserId),
                            ValueConvert.ToPathParameterString(request.Version)
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
                            ValueConvert.ToPathParameterString(request.TenantId),
                            ValueConvert.ToPathParameterString(request.UserId),
                            ValueConvert.ToPathParameterString(request.Version),
                            ValueConvert.ToPathParameterString(request.Thought)
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
