using System.Net.Http;
using System.Text.Json;
using System.Threading;
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
        _query["department"] = request.Department;
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
}
