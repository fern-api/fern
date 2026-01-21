using System.Text.Json;
using SeedClientSideParams.Core;

namespace SeedClientSideParams;

public partial class ServiceClient : IServiceClient
{
    private RawClient _client;

    internal ServiceClient(RawClient client)
    {
        _client = client;
    }

    private async Task<WithRawResponse<IEnumerable<Resource>>> ListResourcesAsyncCore(
        ListResourcesRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _query = new Dictionary<string, object>();
        _query["page"] = request.Page.ToString();
        _query["per_page"] = request.PerPage.ToString();
        _query["sort"] = request.Sort;
        _query["order"] = request.Order;
        _query["include_totals"] = JsonUtils.Serialize(request.IncludeTotals);
        if (request.Fields != null)
        {
            _query["fields"] = request.Fields;
        }
        if (request.Search != null)
        {
            _query["search"] = request.Search;
        }
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = "/api/resources",
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
                var responseData = JsonUtils.Deserialize<IEnumerable<Resource>>(responseBody)!;
                return new WithRawResponse<IEnumerable<Resource>>()
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
                throw new SeedClientSideParamsApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedClientSideParamsApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    private async Task<WithRawResponse<Resource>> GetResourceAsyncCore(
        string resourceId,
        GetResourceRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _query = new Dictionary<string, object>();
        _query["include_metadata"] = JsonUtils.Serialize(request.IncludeMetadata);
        _query["format"] = request.Format;
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = string.Format(
                        "/api/resources/{0}",
                        ValueConvert.ToPathParameterString(resourceId)
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
                var responseData = JsonUtils.Deserialize<Resource>(responseBody)!;
                return new WithRawResponse<Resource>()
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
                throw new SeedClientSideParamsApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedClientSideParamsApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    private async Task<WithRawResponse<SearchResponse>> SearchResourcesAsyncCore(
        SearchResourcesRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _query = new Dictionary<string, object>();
        _query["limit"] = request.Limit.ToString();
        _query["offset"] = request.Offset.ToString();
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = "/api/resources/search",
                    Body = request,
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
                var responseData = JsonUtils.Deserialize<SearchResponse>(responseBody)!;
                return new WithRawResponse<SearchResponse>()
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
                throw new SeedClientSideParamsApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedClientSideParamsApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    private async Task<WithRawResponse<PaginatedUserResponse>> ListUsersAsyncCore(
        ListUsersRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _query = new Dictionary<string, object>();
        if (request.Page != null)
        {
            _query["page"] = request.Page.Value.ToString();
        }
        if (request.PerPage != null)
        {
            _query["per_page"] = request.PerPage.Value.ToString();
        }
        if (request.IncludeTotals != null)
        {
            _query["include_totals"] = JsonUtils.Serialize(request.IncludeTotals.Value);
        }
        if (request.Sort != null)
        {
            _query["sort"] = request.Sort;
        }
        if (request.Connection != null)
        {
            _query["connection"] = request.Connection;
        }
        if (request.Q != null)
        {
            _query["q"] = request.Q;
        }
        if (request.SearchEngine != null)
        {
            _query["search_engine"] = request.SearchEngine;
        }
        if (request.Fields != null)
        {
            _query["fields"] = request.Fields;
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
                var responseData = JsonUtils.Deserialize<PaginatedUserResponse>(responseBody)!;
                return new WithRawResponse<PaginatedUserResponse>()
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
                throw new SeedClientSideParamsApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedClientSideParamsApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    private async Task<WithRawResponse<User>> GetUserByIdAsyncCore(
        string userId,
        GetUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _query = new Dictionary<string, object>();
        if (request.Fields != null)
        {
            _query["fields"] = request.Fields;
        }
        if (request.IncludeFields != null)
        {
            _query["include_fields"] = JsonUtils.Serialize(request.IncludeFields.Value);
        }
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
                throw new SeedClientSideParamsApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedClientSideParamsApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    private async Task<WithRawResponse<User>> CreateUserAsyncCore(
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
                throw new SeedClientSideParamsApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedClientSideParamsApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    private async Task<WithRawResponse<User>> UpdateUserAsyncCore(
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
                throw new SeedClientSideParamsApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedClientSideParamsApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    private async Task<WithRawResponse<IEnumerable<Connection>>> ListConnectionsAsyncCore(
        ListConnectionsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _query = new Dictionary<string, object>();
        if (request.Strategy != null)
        {
            _query["strategy"] = request.Strategy;
        }
        if (request.Name != null)
        {
            _query["name"] = request.Name;
        }
        if (request.Fields != null)
        {
            _query["fields"] = request.Fields;
        }
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = "/api/connections",
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
                var responseData = JsonUtils.Deserialize<IEnumerable<Connection>>(responseBody)!;
                return new WithRawResponse<IEnumerable<Connection>>()
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
                throw new SeedClientSideParamsApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedClientSideParamsApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    private async Task<WithRawResponse<Connection>> GetConnectionAsyncCore(
        string connectionId,
        GetConnectionRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _query = new Dictionary<string, object>();
        if (request.Fields != null)
        {
            _query["fields"] = request.Fields;
        }
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = string.Format(
                        "/api/connections/{0}",
                        ValueConvert.ToPathParameterString(connectionId)
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
                var responseData = JsonUtils.Deserialize<Connection>(responseBody)!;
                return new WithRawResponse<Connection>()
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
                throw new SeedClientSideParamsApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedClientSideParamsApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    private async Task<WithRawResponse<PaginatedClientResponse>> ListClientsAsyncCore(
        ListClientsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _query = new Dictionary<string, object>();
        if (request.Fields != null)
        {
            _query["fields"] = request.Fields;
        }
        if (request.IncludeFields != null)
        {
            _query["include_fields"] = JsonUtils.Serialize(request.IncludeFields.Value);
        }
        if (request.Page != null)
        {
            _query["page"] = request.Page.Value.ToString();
        }
        if (request.PerPage != null)
        {
            _query["per_page"] = request.PerPage.Value.ToString();
        }
        if (request.IncludeTotals != null)
        {
            _query["include_totals"] = JsonUtils.Serialize(request.IncludeTotals.Value);
        }
        if (request.IsGlobal != null)
        {
            _query["is_global"] = JsonUtils.Serialize(request.IsGlobal.Value);
        }
        if (request.IsFirstParty != null)
        {
            _query["is_first_party"] = JsonUtils.Serialize(request.IsFirstParty.Value);
        }
        if (request.AppType != null)
        {
            _query["app_type"] = JsonUtils.Serialize(request.AppType);
        }
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = "/api/clients",
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
                var responseData = JsonUtils.Deserialize<PaginatedClientResponse>(responseBody)!;
                return new WithRawResponse<PaginatedClientResponse>()
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
                throw new SeedClientSideParamsApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedClientSideParamsApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    private async Task<WithRawResponse<Client>> GetClientAsyncCore(
        string clientId,
        GetClientRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _query = new Dictionary<string, object>();
        if (request.Fields != null)
        {
            _query["fields"] = request.Fields;
        }
        if (request.IncludeFields != null)
        {
            _query["include_fields"] = JsonUtils.Serialize(request.IncludeFields.Value);
        }
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = string.Format(
                        "/api/clients/{0}",
                        ValueConvert.ToPathParameterString(clientId)
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
                var responseData = JsonUtils.Deserialize<Client>(responseBody)!;
                return new WithRawResponse<Client>()
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
                throw new SeedClientSideParamsApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedClientSideParamsApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <summary>
    /// List resources with pagination
    /// </summary>
    /// <example><code>
    /// await client.Service.ListResourcesAsync(
    ///     new ListResourcesRequest
    ///     {
    ///         Page = 1,
    ///         PerPage = 1,
    ///         Sort = "created_at",
    ///         Order = "desc",
    ///         IncludeTotals = true,
    ///         Fields = "fields",
    ///         Search = "search",
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<IEnumerable<Resource>> ListResourcesAsync(
        ListResourcesRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<IEnumerable<Resource>>(
            ListResourcesAsyncCore(request, options, cancellationToken)
        );
    }

    /// <summary>
    /// Get a single resource
    /// </summary>
    /// <example><code>
    /// await client.Service.GetResourceAsync(
    ///     "resourceId",
    ///     new GetResourceRequest { IncludeMetadata = true, Format = "json" }
    /// );
    /// </code></example>
    public WithRawResponseTask<Resource> GetResourceAsync(
        string resourceId,
        GetResourceRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<Resource>(
            GetResourceAsyncCore(resourceId, request, options, cancellationToken)
        );
    }

    /// <summary>
    /// Search resources with complex parameters
    /// </summary>
    /// <example><code>
    /// await client.Service.SearchResourcesAsync(
    ///     new SearchResourcesRequest
    ///     {
    ///         Limit = 1,
    ///         Offset = 1,
    ///         Query = "query",
    ///         Filters = new Dictionary&lt;string, object?&gt;()
    ///         {
    ///             {
    ///                 "filters",
    ///                 new Dictionary&lt;object, object?&gt;() { { "key", "value" } }
    ///             },
    ///         },
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<SearchResponse> SearchResourcesAsync(
        SearchResourcesRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<SearchResponse>(
            SearchResourcesAsyncCore(request, options, cancellationToken)
        );
    }

    /// <summary>
    /// List or search for users
    /// </summary>
    /// <example><code>
    /// await client.Service.ListUsersAsync(
    ///     new ListUsersRequest
    ///     {
    ///         Page = 1,
    ///         PerPage = 1,
    ///         IncludeTotals = true,
    ///         Sort = "sort",
    ///         Connection = "connection",
    ///         Q = "q",
    ///         SearchEngine = "search_engine",
    ///         Fields = "fields",
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<PaginatedUserResponse> ListUsersAsync(
        ListUsersRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<PaginatedUserResponse>(
            ListUsersAsyncCore(request, options, cancellationToken)
        );
    }

    /// <summary>
    /// Get a user by ID
    /// </summary>
    /// <example><code>
    /// await client.Service.GetUserByIdAsync(
    ///     "userId",
    ///     new GetUserRequest { Fields = "fields", IncludeFields = true }
    /// );
    /// </code></example>
    public WithRawResponseTask<User> GetUserByIdAsync(
        string userId,
        GetUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<User>(
            GetUserByIdAsyncCore(userId, request, options, cancellationToken)
        );
    }

    /// <summary>
    /// Create a new user
    /// </summary>
    /// <example><code>
    /// await client.Service.CreateUserAsync(
    ///     new CreateUserRequest
    ///     {
    ///         Email = "email",
    ///         EmailVerified = true,
    ///         Username = "username",
    ///         Password = "password",
    ///         PhoneNumber = "phone_number",
    ///         PhoneVerified = true,
    ///         UserMetadata = new Dictionary&lt;string, object?&gt;()
    ///         {
    ///             {
    ///                 "user_metadata",
    ///                 new Dictionary&lt;object, object?&gt;() { { "key", "value" } }
    ///             },
    ///         },
    ///         AppMetadata = new Dictionary&lt;string, object?&gt;()
    ///         {
    ///             {
    ///                 "app_metadata",
    ///                 new Dictionary&lt;object, object?&gt;() { { "key", "value" } }
    ///             },
    ///         },
    ///         Connection = "connection",
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<User> CreateUserAsync(
        CreateUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<User>(
            CreateUserAsyncCore(request, options, cancellationToken)
        );
    }

    /// <summary>
    /// Update a user
    /// </summary>
    /// <example><code>
    /// await client.Service.UpdateUserAsync(
    ///     "userId",
    ///     new UpdateUserRequest
    ///     {
    ///         Email = "email",
    ///         EmailVerified = true,
    ///         Username = "username",
    ///         PhoneNumber = "phone_number",
    ///         PhoneVerified = true,
    ///         UserMetadata = new Dictionary&lt;string, object?&gt;()
    ///         {
    ///             {
    ///                 "user_metadata",
    ///                 new Dictionary&lt;object, object?&gt;() { { "key", "value" } }
    ///             },
    ///         },
    ///         AppMetadata = new Dictionary&lt;string, object?&gt;()
    ///         {
    ///             {
    ///                 "app_metadata",
    ///                 new Dictionary&lt;object, object?&gt;() { { "key", "value" } }
    ///             },
    ///         },
    ///         Password = "password",
    ///         Blocked = true,
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<User> UpdateUserAsync(
        string userId,
        UpdateUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<User>(
            UpdateUserAsyncCore(userId, request, options, cancellationToken)
        );
    }

    /// <summary>
    /// Delete a user
    /// </summary>
    /// <example><code>
    /// await client.Service.DeleteUserAsync("userId");
    /// </code></example>
    public async Task DeleteUserAsync(
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
                    Method = HttpMethod.Delete,
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
            return;
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedClientSideParamsApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <summary>
    /// List all connections
    /// </summary>
    /// <example><code>
    /// await client.Service.ListConnectionsAsync(
    ///     new ListConnectionsRequest
    ///     {
    ///         Strategy = "strategy",
    ///         Name = "name",
    ///         Fields = "fields",
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<IEnumerable<Connection>> ListConnectionsAsync(
        ListConnectionsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<IEnumerable<Connection>>(
            ListConnectionsAsyncCore(request, options, cancellationToken)
        );
    }

    /// <summary>
    /// Get a connection by ID
    /// </summary>
    /// <example><code>
    /// await client.Service.GetConnectionAsync(
    ///     "connectionId",
    ///     new GetConnectionRequest { Fields = "fields" }
    /// );
    /// </code></example>
    public WithRawResponseTask<Connection> GetConnectionAsync(
        string connectionId,
        GetConnectionRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<Connection>(
            GetConnectionAsyncCore(connectionId, request, options, cancellationToken)
        );
    }

    /// <summary>
    /// List all clients/applications
    /// </summary>
    /// <example><code>
    /// await client.Service.ListClientsAsync(
    ///     new ListClientsRequest
    ///     {
    ///         Fields = "fields",
    ///         IncludeFields = true,
    ///         Page = 1,
    ///         PerPage = 1,
    ///         IncludeTotals = true,
    ///         IsGlobal = true,
    ///         IsFirstParty = true,
    ///         AppType = new List&lt;string&gt;() { "app_type", "app_type" },
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<PaginatedClientResponse> ListClientsAsync(
        ListClientsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<PaginatedClientResponse>(
            ListClientsAsyncCore(request, options, cancellationToken)
        );
    }

    /// <summary>
    /// Get a client by ID
    /// </summary>
    /// <example><code>
    /// await client.Service.GetClientAsync(
    ///     "clientId",
    ///     new GetClientRequest { Fields = "fields", IncludeFields = true }
    /// );
    /// </code></example>
    public WithRawResponseTask<Client> GetClientAsync(
        string clientId,
        GetClientRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<Client>(
            GetClientAsyncCore(clientId, request, options, cancellationToken)
        );
    }
}
