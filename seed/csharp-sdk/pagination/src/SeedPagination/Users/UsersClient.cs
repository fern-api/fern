using System.Net.Http;
using System.Text.Json;
using System.Threading;
using SeedPagination.Core;

#nullable enable

namespace SeedPagination;

public partial class UsersClient
{
    private RawClient _client;

    internal UsersClient(RawClient client)
    {
        _client = client;
    }

    /// <example>
    /// <code>
    /// await client.Users.ListWithCursorPaginationAsync(
    ///     new ListUsersCursorPaginationRequest
    ///     {
    ///         Page = 1,
    ///         PerPage = 1,
    ///         Order = Order.Asc,
    ///         StartingAfter = "starting_after",
    ///     }
    /// );
    /// </code>
    /// </example>
    public Pager<User> ListWithCursorPaginationAsync(
        ListUsersCursorPaginationRequest request,
        RequestOptions? options = null
    )
    {
        var pager = new CursorPager<
            ListUsersCursorPaginationRequest,
            RequestOptions?,
            ListUsersPaginationResponse,
            string,
            User
        >(
            request,
            options,
            ListWithCursorPaginationAsync,
            (request, cursor) =>
            {
                request.StartingAfter = cursor;
            },
            response => response?.Page?.Next?.StartingAfter,
            response => response?.Data?.ToList()
        );
        return pager;
    }

    /// <example>
    /// <code>
    /// await client.Users.ListWithBodyCursorPaginationAsync(
    ///     new ListUsersBodyCursorPaginationRequest { Pagination = new WithCursor { Cursor = "cursor" } }
    /// );
    /// </code>
    /// </example>
    public Pager<User> ListWithBodyCursorPaginationAsync(
        ListUsersBodyCursorPaginationRequest request,
        RequestOptions? options = null
    )
    {
        var pager = new CursorPager<
            ListUsersBodyCursorPaginationRequest,
            RequestOptions?,
            ListUsersPaginationResponse,
            string,
            User
        >(
            request,
            options,
            ListWithBodyCursorPaginationAsync,
            (request, cursor) =>
            {
                request.Pagination ??= new();
                request.Pagination.Cursor = cursor;
            },
            response => response?.Page?.Next?.StartingAfter,
            response => response?.Data?.ToList()
        );
        return pager;
    }

    /// <example>
    /// <code>
    /// await client.Users.ListWithOffsetPaginationAsync(
    ///     new ListUsersOffsetPaginationRequest
    ///     {
    ///         Page = 1,
    ///         PerPage = 1,
    ///         Order = Order.Asc,
    ///         StartingAfter = "starting_after",
    ///     }
    /// );
    /// </code>
    /// </example>
    public Pager<User> ListWithOffsetPaginationAsync(
        ListUsersOffsetPaginationRequest request,
        RequestOptions? options = null
    )
    {
        var pager = new OffsetPager<
            ListUsersOffsetPaginationRequest,
            RequestOptions?,
            ListUsersPaginationResponse,
            int?,
            object,
            User
        >(
            request,
            options,
            ListWithOffsetPaginationAsync,
            request => request?.Page ?? 0,
            (request, offset) =>
            {
                request.Page = offset;
            },
            null,
            response => response?.Data?.ToList(),
            null
        );
        return pager;
    }

    /// <example>
    /// <code>
    /// await client.Users.ListWithBodyOffsetPaginationAsync(
    ///     new ListUsersBodyOffsetPaginationRequest { Pagination = new WithPage { Page = 1 } }
    /// );
    /// </code>
    /// </example>
    public Pager<User> ListWithBodyOffsetPaginationAsync(
        ListUsersBodyOffsetPaginationRequest request,
        RequestOptions? options = null
    )
    {
        var pager = new OffsetPager<
            ListUsersBodyOffsetPaginationRequest,
            RequestOptions?,
            ListUsersPaginationResponse,
            int?,
            object,
            User
        >(
            request,
            options,
            ListWithBodyOffsetPaginationAsync,
            request => request?.Pagination?.Page ?? 0,
            (request, offset) =>
            {
                request.Pagination ??= new();
                request.Pagination.Page = offset;
            },
            null,
            response => response?.Data?.ToList(),
            null
        );
        return pager;
    }

    /// <example>
    /// <code>
    /// await client.Users.ListWithOffsetStepPaginationAsync(
    ///     new ListUsersOffsetStepPaginationRequest
    ///     {
    ///         Page = 1,
    ///         Limit = 1,
    ///         Order = Order.Asc,
    ///     }
    /// );
    /// </code>
    /// </example>
    public Pager<User> ListWithOffsetStepPaginationAsync(
        ListUsersOffsetStepPaginationRequest request,
        RequestOptions? options = null
    )
    {
        var pager = new OffsetPager<
            ListUsersOffsetStepPaginationRequest,
            RequestOptions?,
            ListUsersPaginationResponse,
            int?,
            int?,
            User
        >(
            request,
            options,
            ListWithOffsetStepPaginationAsync,
            request => request?.Page ?? 0,
            (request, offset) =>
            {
                request.Page = offset;
            },
            request => request?.Limit ?? 0,
            response => response?.Data?.ToList(),
            null
        );
        return pager;
    }

    /// <example>
    /// <code>
    /// await client.Users.ListWithOffsetPaginationHasNextPageAsync(
    ///     new ListWithOffsetPaginationHasNextPageRequest
    ///     {
    ///         Page = 1,
    ///         Limit = 1,
    ///         Order = Order.Asc,
    ///     }
    /// );
    /// </code>
    /// </example>
    public Pager<User> ListWithOffsetPaginationHasNextPageAsync(
        ListWithOffsetPaginationHasNextPageRequest request,
        RequestOptions? options = null
    )
    {
        var pager = new OffsetPager<
            ListWithOffsetPaginationHasNextPageRequest,
            RequestOptions?,
            ListUsersPaginationResponse,
            int?,
            int?,
            User
        >(
            request,
            options,
            ListWithOffsetPaginationHasNextPageAsync,
            request => request?.Page ?? 0,
            (request, offset) =>
            {
                request.Page = offset;
            },
            request => request?.Limit ?? 0,
            response => response?.Data?.ToList(),
            response => response?.HasNextPage
        );
        return pager;
    }

    /// <example>
    /// <code>
    /// await client.Users.ListWithExtendedResultsAsync(
    ///     new ListUsersExtendedRequest { Cursor = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32" }
    /// );
    /// </code>
    /// </example>
    public Pager<User> ListWithExtendedResultsAsync(
        ListUsersExtendedRequest request,
        RequestOptions? options = null
    )
    {
        var pager = new CursorPager<
            ListUsersExtendedRequest,
            RequestOptions?,
            ListUsersExtendedResponse,
            string?,
            User
        >(
            request,
            options,
            ListWithExtendedResultsAsync,
            (request, cursor) =>
            {
                request.Cursor = cursor;
            },
            response => response?.Next,
            response => response?.Data?.Users?.ToList()
        );
        return pager;
    }

    /// <example>
    /// <code>
    /// await client.Users.ListWithExtendedResultsAndOptionalDataAsync(
    ///     new ListUsersExtendedRequestForOptionalData { Cursor = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32" }
    /// );
    /// </code>
    /// </example>
    public Pager<User> ListWithExtendedResultsAndOptionalDataAsync(
        ListUsersExtendedRequestForOptionalData request,
        RequestOptions? options = null
    )
    {
        var pager = new CursorPager<
            ListUsersExtendedRequestForOptionalData,
            RequestOptions?,
            ListUsersExtendedOptionalListResponse,
            string?,
            User
        >(
            request,
            options,
            ListWithExtendedResultsAndOptionalDataAsync,
            (request, cursor) =>
            {
                request.Cursor = cursor;
            },
            response => response?.Next,
            response => response?.Data?.Users?.ToList()
        );
        return pager;
    }

    /// <example>
    /// <code>
    /// await client.Users.ListUsernamesAsync(
    ///     new ListUsernamesRequest { StartingAfter = "starting_after" }
    /// );
    /// </code>
    /// </example>
    public Pager<string> ListUsernamesAsync(
        ListUsernamesRequest request,
        RequestOptions? options = null
    )
    {
        var pager = new CursorPager<
            ListUsernamesRequest,
            RequestOptions?,
            UsernameCursor,
            string?,
            string
        >(
            request,
            options,
            ListUsernamesAsync,
            (request, cursor) =>
            {
                request.StartingAfter = cursor;
            },
            response => response?.Cursor?.After,
            response => response?.Cursor?.Data?.ToList()
        );
        return pager;
    }

    /// <example>
    /// <code>
    /// await client.Users.ListWithGlobalConfigAsync(new ListWithGlobalConfigRequest { Offset = 1 });
    /// </code>
    /// </example>
    public Pager<string> ListWithGlobalConfigAsync(
        ListWithGlobalConfigRequest request,
        RequestOptions? options = null
    )
    {
        var pager = new OffsetPager<
            ListWithGlobalConfigRequest,
            RequestOptions?,
            UsernameContainer,
            int?,
            object,
            string
        >(
            request,
            options,
            ListWithGlobalConfigAsync,
            request => request?.Offset ?? 0,
            (request, offset) =>
            {
                request.Offset = offset;
            },
            null,
            response => response?.Results?.ToList(),
            null
        );
        return pager;
    }

    internal async Task<ListUsersPaginationResponse> ListWithCursorPaginationAsync(
        ListUsersCursorPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _query = new Dictionary<string, object>();
        if (request.Page != null)
        {
            _query["page"] = request.Page.ToString();
        }
        if (request.PerPage != null)
        {
            _query["per_page"] = request.PerPage.ToString();
        }
        if (request.Order != null)
        {
            _query["order"] = request.Order.Value.Stringify();
        }
        if (request.StartingAfter != null)
        {
            _query["starting_after"] = request.StartingAfter;
        }
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Get,
                Path = "/users",
                Query = _query,
                Options = options,
            },
            cancellationToken
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            try
            {
                return JsonUtils.Deserialize<ListUsersPaginationResponse>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedPaginationException("Failed to deserialize response", e);
            }
        }

        throw new SeedPaginationApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }

    internal async Task<ListUsersPaginationResponse> ListWithBodyCursorPaginationAsync(
        ListUsersBodyCursorPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = "/users",
                Body = request,
                Options = options,
            },
            cancellationToken
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            try
            {
                return JsonUtils.Deserialize<ListUsersPaginationResponse>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedPaginationException("Failed to deserialize response", e);
            }
        }

        throw new SeedPaginationApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }

    internal async Task<ListUsersPaginationResponse> ListWithOffsetPaginationAsync(
        ListUsersOffsetPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _query = new Dictionary<string, object>();
        if (request.Page != null)
        {
            _query["page"] = request.Page.ToString();
        }
        if (request.PerPage != null)
        {
            _query["per_page"] = request.PerPage.ToString();
        }
        if (request.Order != null)
        {
            _query["order"] = request.Order.Value.Stringify();
        }
        if (request.StartingAfter != null)
        {
            _query["starting_after"] = request.StartingAfter;
        }
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Get,
                Path = "/users",
                Query = _query,
                Options = options,
            },
            cancellationToken
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            try
            {
                return JsonUtils.Deserialize<ListUsersPaginationResponse>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedPaginationException("Failed to deserialize response", e);
            }
        }

        throw new SeedPaginationApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }

    internal async Task<ListUsersPaginationResponse> ListWithBodyOffsetPaginationAsync(
        ListUsersBodyOffsetPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = "/users",
                Body = request,
                Options = options,
            },
            cancellationToken
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            try
            {
                return JsonUtils.Deserialize<ListUsersPaginationResponse>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedPaginationException("Failed to deserialize response", e);
            }
        }

        throw new SeedPaginationApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }

    internal async Task<ListUsersPaginationResponse> ListWithOffsetStepPaginationAsync(
        ListUsersOffsetStepPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _query = new Dictionary<string, object>();
        if (request.Page != null)
        {
            _query["page"] = request.Page.ToString();
        }
        if (request.Limit != null)
        {
            _query["limit"] = request.Limit.ToString();
        }
        if (request.Order != null)
        {
            _query["order"] = request.Order.Value.Stringify();
        }
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Get,
                Path = "/users",
                Query = _query,
                Options = options,
            },
            cancellationToken
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            try
            {
                return JsonUtils.Deserialize<ListUsersPaginationResponse>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedPaginationException("Failed to deserialize response", e);
            }
        }

        throw new SeedPaginationApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }

    internal async Task<ListUsersPaginationResponse> ListWithOffsetPaginationHasNextPageAsync(
        ListWithOffsetPaginationHasNextPageRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _query = new Dictionary<string, object>();
        if (request.Page != null)
        {
            _query["page"] = request.Page.ToString();
        }
        if (request.Limit != null)
        {
            _query["limit"] = request.Limit.ToString();
        }
        if (request.Order != null)
        {
            _query["order"] = request.Order.Value.Stringify();
        }
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Get,
                Path = "/users",
                Query = _query,
                Options = options,
            },
            cancellationToken
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            try
            {
                return JsonUtils.Deserialize<ListUsersPaginationResponse>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedPaginationException("Failed to deserialize response", e);
            }
        }

        throw new SeedPaginationApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }

    internal async Task<ListUsersExtendedResponse> ListWithExtendedResultsAsync(
        ListUsersExtendedRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _query = new Dictionary<string, object>();
        if (request.Cursor != null)
        {
            _query["cursor"] = request.Cursor.ToString();
        }
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Get,
                Path = "/users",
                Query = _query,
                Options = options,
            },
            cancellationToken
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            try
            {
                return JsonUtils.Deserialize<ListUsersExtendedResponse>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedPaginationException("Failed to deserialize response", e);
            }
        }

        throw new SeedPaginationApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }

    internal async Task<ListUsersExtendedOptionalListResponse> ListWithExtendedResultsAndOptionalDataAsync(
        ListUsersExtendedRequestForOptionalData request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _query = new Dictionary<string, object>();
        if (request.Cursor != null)
        {
            _query["cursor"] = request.Cursor.ToString();
        }
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Get,
                Path = "/users",
                Query = _query,
                Options = options,
            },
            cancellationToken
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            try
            {
                return JsonUtils.Deserialize<ListUsersExtendedOptionalListResponse>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedPaginationException("Failed to deserialize response", e);
            }
        }

        throw new SeedPaginationApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }

    internal async Task<UsernameCursor> ListUsernamesAsync(
        ListUsernamesRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _query = new Dictionary<string, object>();
        if (request.StartingAfter != null)
        {
            _query["starting_after"] = request.StartingAfter;
        }
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Get,
                Path = "/users",
                Query = _query,
                Options = options,
            },
            cancellationToken
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            try
            {
                return JsonUtils.Deserialize<UsernameCursor>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedPaginationException("Failed to deserialize response", e);
            }
        }

        throw new SeedPaginationApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }

    internal async Task<UsernameContainer> ListWithGlobalConfigAsync(
        ListWithGlobalConfigRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _query = new Dictionary<string, object>();
        if (request.Offset != null)
        {
            _query["offset"] = request.Offset.ToString();
        }
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Get,
                Path = "/users",
                Query = _query,
                Options = options,
            },
            cancellationToken
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            try
            {
                return JsonUtils.Deserialize<UsernameContainer>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedPaginationException("Failed to deserialize response", e);
            }
        }

        throw new SeedPaginationApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }
}
