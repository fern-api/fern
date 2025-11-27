using System.Text.Json;
using SeedPagination.Core;

namespace SeedPagination;

public partial class UsersClient
{
    private RawClient _client;

    private RawUsersClient _rawClient;

    internal UsersClient(RawClient client)
    {
        _client = client;
        _rawClient = new RawUsersClient(_client);
        WithRawResponse = _rawClient;
    }

    /// <summary>
    /// Access endpoints with raw HTTP response data (status code, headers).
    /// </summary>
    public RawUsersClient WithRawResponse { get; }

    private async Task<ListUsersPaginationResponse> ListWithCursorPaginationInternalAsync(
        ListUsersCursorPaginationRequest request,
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
        if (request.Order != null)
        {
            _query["order"] = request.Order.Value.Stringify();
        }
        if (request.StartingAfter != null)
        {
            _query["starting_after"] = request.StartingAfter;
        }
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = "/users",
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
                return JsonUtils.Deserialize<ListUsersPaginationResponse>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedPaginationException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedPaginationApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    private async Task<ListUsersMixedTypePaginationResponse> ListWithMixedTypeCursorPaginationInternalAsync(
        ListUsersMixedTypeCursorPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _query = new Dictionary<string, object>();
        if (request.Cursor != null)
        {
            _query["cursor"] = request.Cursor;
        }
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = "/users",
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
                return JsonUtils.Deserialize<ListUsersMixedTypePaginationResponse>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedPaginationException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedPaginationApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    private async Task<ListUsersPaginationResponse> ListWithBodyCursorPaginationInternalAsync(
        ListUsersBodyCursorPaginationRequest request,
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
                    Path = "/users",
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
                return JsonUtils.Deserialize<ListUsersPaginationResponse>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedPaginationException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedPaginationApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    private async Task<ListUsersPaginationResponse> ListWithOffsetPaginationInternalAsync(
        ListUsersOffsetPaginationRequest request,
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
        if (request.Order != null)
        {
            _query["order"] = request.Order.Value.Stringify();
        }
        if (request.StartingAfter != null)
        {
            _query["starting_after"] = request.StartingAfter;
        }
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = "/users",
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
                return JsonUtils.Deserialize<ListUsersPaginationResponse>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedPaginationException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedPaginationApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    private async Task<ListUsersPaginationResponse> ListWithDoubleOffsetPaginationInternalAsync(
        ListUsersDoubleOffsetPaginationRequest request,
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
        if (request.Order != null)
        {
            _query["order"] = request.Order.Value.Stringify();
        }
        if (request.StartingAfter != null)
        {
            _query["starting_after"] = request.StartingAfter;
        }
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = "/users",
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
                return JsonUtils.Deserialize<ListUsersPaginationResponse>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedPaginationException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedPaginationApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    private async Task<ListUsersPaginationResponse> ListWithBodyOffsetPaginationInternalAsync(
        ListUsersBodyOffsetPaginationRequest request,
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
                    Path = "/users",
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
                return JsonUtils.Deserialize<ListUsersPaginationResponse>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedPaginationException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedPaginationApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    private async Task<ListUsersPaginationResponse> ListWithOffsetStepPaginationInternalAsync(
        ListUsersOffsetStepPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _query = new Dictionary<string, object>();
        if (request.Page != null)
        {
            _query["page"] = request.Page.Value.ToString();
        }
        if (request.Limit != null)
        {
            _query["limit"] = request.Limit.Value.ToString();
        }
        if (request.Order != null)
        {
            _query["order"] = request.Order.Value.Stringify();
        }
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = "/users",
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
                return JsonUtils.Deserialize<ListUsersPaginationResponse>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedPaginationException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedPaginationApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    private async Task<ListUsersPaginationResponse> ListWithOffsetPaginationHasNextPageInternalAsync(
        ListWithOffsetPaginationHasNextPageRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _query = new Dictionary<string, object>();
        if (request.Page != null)
        {
            _query["page"] = request.Page.Value.ToString();
        }
        if (request.Limit != null)
        {
            _query["limit"] = request.Limit.Value.ToString();
        }
        if (request.Order != null)
        {
            _query["order"] = request.Order.Value.Stringify();
        }
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = "/users",
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
                return JsonUtils.Deserialize<ListUsersPaginationResponse>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedPaginationException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedPaginationApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    private async Task<ListUsersExtendedResponse> ListWithExtendedResultsInternalAsync(
        ListUsersExtendedRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _query = new Dictionary<string, object>();
        if (request.Cursor != null)
        {
            _query["cursor"] = request.Cursor;
        }
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = "/users",
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
                return JsonUtils.Deserialize<ListUsersExtendedResponse>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedPaginationException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedPaginationApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    private async Task<ListUsersExtendedOptionalListResponse> ListWithExtendedResultsAndOptionalDataInternalAsync(
        ListUsersExtendedRequestForOptionalData request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _query = new Dictionary<string, object>();
        if (request.Cursor != null)
        {
            _query["cursor"] = request.Cursor;
        }
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = "/users",
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
                return JsonUtils.Deserialize<ListUsersExtendedOptionalListResponse>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedPaginationException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedPaginationApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    private async Task<UsernameCursor> ListUsernamesInternalAsync(
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
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = "/users",
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
                return JsonUtils.Deserialize<UsernameCursor>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedPaginationException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedPaginationApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    private async Task<UsernameContainer> ListWithGlobalConfigInternalAsync(
        ListWithGlobalConfigRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _query = new Dictionary<string, object>();
        if (request.Offset != null)
        {
            _query["offset"] = request.Offset.Value.ToString();
        }
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = "/users",
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
                return JsonUtils.Deserialize<UsernameContainer>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedPaginationException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedPaginationApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.Users.ListWithCursorPaginationAsync(
    ///     new SeedPagination.ListUsersCursorPaginationRequest
    ///     {
    ///         Page = 1,
    ///         PerPage = 1,
    ///         Order = SeedPagination.Order.Asc,
    ///         StartingAfter = "starting_after",
    ///     }
    /// );
    /// </code></example>
    public async Task<Pager<User>> ListWithCursorPaginationAsync(
        ListUsersCursorPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        if (request is not null)
        {
            request = request with { };
        }
        var pager = await CursorPager<
            ListUsersCursorPaginationRequest,
            RequestOptions?,
            ListUsersPaginationResponse,
            string,
            User
        >
            .CreateInstanceAsync(
                request,
                options,
                ListWithCursorPaginationInternalAsync,
                (request, cursor) =>
                {
                    request.StartingAfter = cursor;
                },
                response => response.Page?.Next?.StartingAfter,
                response => response.Data?.ToList(),
                cancellationToken
            )
            .ConfigureAwait(false);
        return pager;
    }

    /// <example><code>
    /// await client.Users.ListWithMixedTypeCursorPaginationAsync(
    ///     new SeedPagination.ListUsersMixedTypeCursorPaginationRequest { Cursor = "cursor" }
    /// );
    /// </code></example>
    public async Task<Pager<User>> ListWithMixedTypeCursorPaginationAsync(
        ListUsersMixedTypeCursorPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        if (request is not null)
        {
            request = request with { };
        }
        var pager = await CursorPager<
            ListUsersMixedTypeCursorPaginationRequest,
            RequestOptions?,
            ListUsersMixedTypePaginationResponse,
            string,
            User
        >
            .CreateInstanceAsync(
                request,
                options,
                ListWithMixedTypeCursorPaginationInternalAsync,
                (request, cursor) =>
                {
                    request.Cursor = cursor;
                },
                response => response.Next,
                response => response.Data?.ToList(),
                cancellationToken
            )
            .ConfigureAwait(false);
        return pager;
    }

    /// <example><code>
    /// await client.Users.ListWithBodyCursorPaginationAsync(
    ///     new SeedPagination.ListUsersBodyCursorPaginationRequest
    ///     {
    ///         Pagination = new SeedPagination.WithCursor { Cursor = "cursor" },
    ///     }
    /// );
    /// </code></example>
    public async Task<Pager<User>> ListWithBodyCursorPaginationAsync(
        ListUsersBodyCursorPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        if (request is not null)
        {
            request = request with { };
        }
        var pager = await CursorPager<
            ListUsersBodyCursorPaginationRequest,
            RequestOptions?,
            ListUsersPaginationResponse,
            string,
            User
        >
            .CreateInstanceAsync(
                request,
                options,
                ListWithBodyCursorPaginationInternalAsync,
                (request, cursor) =>
                {
                    request.Pagination ??= new WithCursor();
                    request.Pagination.Cursor = cursor;
                },
                response => response.Page?.Next?.StartingAfter,
                response => response.Data?.ToList(),
                cancellationToken
            )
            .ConfigureAwait(false);
        return pager;
    }

    /// <example><code>
    /// await client.Users.ListWithOffsetPaginationAsync(
    ///     new SeedPagination.ListUsersOffsetPaginationRequest
    ///     {
    ///         Page = 1,
    ///         PerPage = 1,
    ///         Order = SeedPagination.Order.Asc,
    ///         StartingAfter = "starting_after",
    ///     }
    /// );
    /// </code></example>
    public async Task<Pager<User>> ListWithOffsetPaginationAsync(
        ListUsersOffsetPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        request = request with { };
        var pager = await OffsetPager<
            ListUsersOffsetPaginationRequest,
            RequestOptions?,
            ListUsersPaginationResponse,
            int?,
            object,
            User
        >
            .CreateInstanceAsync(
                request,
                options,
                ListWithOffsetPaginationInternalAsync,
                request => request.Page ?? 0,
                (request, offset) =>
                {
                    request.Page = offset;
                },
                null,
                response => response.Data?.ToList(),
                null,
                cancellationToken
            )
            .ConfigureAwait(false);
        return pager;
    }

    /// <example><code>
    /// await client.Users.ListWithDoubleOffsetPaginationAsync(
    ///     new SeedPagination.ListUsersDoubleOffsetPaginationRequest
    ///     {
    ///         Page = 1.1,
    ///         PerPage = 1.1,
    ///         Order = SeedPagination.Order.Asc,
    ///         StartingAfter = "starting_after",
    ///     }
    /// );
    /// </code></example>
    public async Task<Pager<User>> ListWithDoubleOffsetPaginationAsync(
        ListUsersDoubleOffsetPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        request = request with { };
        var pager = await OffsetPager<
            ListUsersDoubleOffsetPaginationRequest,
            RequestOptions?,
            ListUsersPaginationResponse,
            double?,
            object,
            User
        >
            .CreateInstanceAsync(
                request,
                options,
                ListWithDoubleOffsetPaginationInternalAsync,
                request => request.Page ?? 0,
                (request, offset) =>
                {
                    request.Page = offset;
                },
                null,
                response => response.Data?.ToList(),
                null,
                cancellationToken
            )
            .ConfigureAwait(false);
        return pager;
    }

    /// <example><code>
    /// await client.Users.ListWithBodyOffsetPaginationAsync(
    ///     new SeedPagination.ListUsersBodyOffsetPaginationRequest
    ///     {
    ///         Pagination = new SeedPagination.WithPage { Page = 1 },
    ///     }
    /// );
    /// </code></example>
    public async Task<Pager<User>> ListWithBodyOffsetPaginationAsync(
        ListUsersBodyOffsetPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        request = request with { };
        var pager = await OffsetPager<
            ListUsersBodyOffsetPaginationRequest,
            RequestOptions?,
            ListUsersPaginationResponse,
            int?,
            object,
            User
        >
            .CreateInstanceAsync(
                request,
                options,
                ListWithBodyOffsetPaginationInternalAsync,
                request => request.Pagination?.Page ?? 0,
                (request, offset) =>
                {
                    request.Pagination ??= new();
                    request.Pagination.Page = offset;
                },
                null,
                response => response.Data?.ToList(),
                null,
                cancellationToken
            )
            .ConfigureAwait(false);
        return pager;
    }

    /// <example><code>
    /// await client.Users.ListWithOffsetStepPaginationAsync(
    ///     new SeedPagination.ListUsersOffsetStepPaginationRequest
    ///     {
    ///         Page = 1,
    ///         Limit = 1,
    ///         Order = SeedPagination.Order.Asc,
    ///     }
    /// );
    /// </code></example>
    public async Task<Pager<User>> ListWithOffsetStepPaginationAsync(
        ListUsersOffsetStepPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        request = request with { };
        var pager = await OffsetPager<
            ListUsersOffsetStepPaginationRequest,
            RequestOptions?,
            ListUsersPaginationResponse,
            int?,
            int?,
            User
        >
            .CreateInstanceAsync(
                request,
                options,
                ListWithOffsetStepPaginationInternalAsync,
                request => request.Page ?? 0,
                (request, offset) =>
                {
                    request.Page = offset;
                },
                request => request.Limit ?? 0,
                response => response.Data?.ToList(),
                null,
                cancellationToken
            )
            .ConfigureAwait(false);
        return pager;
    }

    /// <example><code>
    /// await client.Users.ListWithOffsetPaginationHasNextPageAsync(
    ///     new SeedPagination.ListWithOffsetPaginationHasNextPageRequest
    ///     {
    ///         Page = 1,
    ///         Limit = 1,
    ///         Order = SeedPagination.Order.Asc,
    ///     }
    /// );
    /// </code></example>
    public async Task<Pager<User>> ListWithOffsetPaginationHasNextPageAsync(
        ListWithOffsetPaginationHasNextPageRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        request = request with { };
        var pager = await OffsetPager<
            ListWithOffsetPaginationHasNextPageRequest,
            RequestOptions?,
            ListUsersPaginationResponse,
            int?,
            int?,
            User
        >
            .CreateInstanceAsync(
                request,
                options,
                ListWithOffsetPaginationHasNextPageInternalAsync,
                request => request.Page ?? 0,
                (request, offset) =>
                {
                    request.Page = offset;
                },
                request => request.Limit ?? 0,
                response => response.Data?.ToList(),
                response => response.HasNextPage,
                cancellationToken
            )
            .ConfigureAwait(false);
        return pager;
    }

    /// <example><code>
    /// await client.Users.ListWithExtendedResultsAsync(
    ///     new SeedPagination.ListUsersExtendedRequest { Cursor = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32" }
    /// );
    /// </code></example>
    public async Task<Pager<User>> ListWithExtendedResultsAsync(
        ListUsersExtendedRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        if (request is not null)
        {
            request = request with { };
        }
        var pager = await CursorPager<
            ListUsersExtendedRequest,
            RequestOptions?,
            ListUsersExtendedResponse,
            string?,
            User
        >
            .CreateInstanceAsync(
                request,
                options,
                ListWithExtendedResultsInternalAsync,
                (request, cursor) =>
                {
                    request.Cursor = cursor;
                },
                response => response.Next,
                response => response.Data.Users?.ToList(),
                cancellationToken
            )
            .ConfigureAwait(false);
        return pager;
    }

    /// <example><code>
    /// await client.Users.ListWithExtendedResultsAndOptionalDataAsync(
    ///     new SeedPagination.ListUsersExtendedRequestForOptionalData
    ///     {
    ///         Cursor = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ///     }
    /// );
    /// </code></example>
    public async Task<Pager<User>> ListWithExtendedResultsAndOptionalDataAsync(
        ListUsersExtendedRequestForOptionalData request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        if (request is not null)
        {
            request = request with { };
        }
        var pager = await CursorPager<
            ListUsersExtendedRequestForOptionalData,
            RequestOptions?,
            ListUsersExtendedOptionalListResponse,
            string?,
            User
        >
            .CreateInstanceAsync(
                request,
                options,
                ListWithExtendedResultsAndOptionalDataInternalAsync,
                (request, cursor) =>
                {
                    request.Cursor = cursor;
                },
                response => response.Next,
                response => response.Data.Users?.ToList(),
                cancellationToken
            )
            .ConfigureAwait(false);
        return pager;
    }

    /// <example><code>
    /// await client.Users.ListUsernamesAsync(
    ///     new SeedPagination.ListUsernamesRequest { StartingAfter = "starting_after" }
    /// );
    /// </code></example>
    public async Task<Pager<string>> ListUsernamesAsync(
        ListUsernamesRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        if (request is not null)
        {
            request = request with { };
        }
        var pager = await CursorPager<
            ListUsernamesRequest,
            RequestOptions?,
            UsernameCursor,
            string?,
            string
        >
            .CreateInstanceAsync(
                request,
                options,
                ListUsernamesInternalAsync,
                (request, cursor) =>
                {
                    request.StartingAfter = cursor;
                },
                response => response.Cursor.After,
                response => response.Cursor.Data?.ToList(),
                cancellationToken
            )
            .ConfigureAwait(false);
        return pager;
    }

    /// <example><code>
    /// await client.Users.ListWithGlobalConfigAsync(
    ///     new SeedPagination.ListWithGlobalConfigRequest { Offset = 1 }
    /// );
    /// </code></example>
    public async Task<Pager<string>> ListWithGlobalConfigAsync(
        ListWithGlobalConfigRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        request = request with { };
        var pager = await OffsetPager<
            ListWithGlobalConfigRequest,
            RequestOptions?,
            UsernameContainer,
            int?,
            object,
            string
        >
            .CreateInstanceAsync(
                request,
                options,
                ListWithGlobalConfigInternalAsync,
                request => request.Offset ?? 0,
                (request, offset) =>
                {
                    request.Offset = offset;
                },
                null,
                response => response.Results?.ToList(),
                null,
                cancellationToken
            )
            .ConfigureAwait(false);
        return pager;
    }
}
