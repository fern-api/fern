using System.Text.Json;
using SeedPagination;
using SeedPagination.Core;

namespace SeedPagination.InlineUsers;

public partial class RawInlineUsersClient
{
    private RawClient _client;

    internal RawInlineUsersClient(RawClient client)
    {
        _client = client;
    }

    public async Task<RawResponse<ListUsersPaginationResponse>> ListWithCursorPaginationAsync(
        ListUsersCursorPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
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
                            Path = "/inline-users",
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
                        var body = JsonUtils.Deserialize<ListUsersPaginationResponse>(
                            responseBody
                        )!;
                        return new RawResponse<ListUsersPaginationResponse>
                        {
                            Body = body,
                            StatusCode = response.StatusCode,
                            Headers = response.Raw.Headers,
                        };
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
            })
            .ConfigureAwait(false);
    }

    public async Task<
        RawResponse<ListUsersMixedTypePaginationResponse>
    > ListWithMixedTypeCursorPaginationAsync(
        ListUsersMixedTypeCursorPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
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
                            Path = "/inline-users",
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
                        var body = JsonUtils.Deserialize<ListUsersMixedTypePaginationResponse>(
                            responseBody
                        )!;
                        return new RawResponse<ListUsersMixedTypePaginationResponse>
                        {
                            Body = body,
                            StatusCode = response.StatusCode,
                            Headers = response.Raw.Headers,
                        };
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
            })
            .ConfigureAwait(false);
    }

    public async Task<RawResponse<ListUsersPaginationResponse>> ListWithBodyCursorPaginationAsync(
        ListUsersBodyCursorPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var response = await _client
                    .SendRequestAsync(
                        new JsonRequest
                        {
                            BaseUrl = _client.Options.BaseUrl,
                            Method = HttpMethod.Post,
                            Path = "/inline-users",
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
                        var body = JsonUtils.Deserialize<ListUsersPaginationResponse>(
                            responseBody
                        )!;
                        return new RawResponse<ListUsersPaginationResponse>
                        {
                            Body = body,
                            StatusCode = response.StatusCode,
                            Headers = response.Raw.Headers,
                        };
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
            })
            .ConfigureAwait(false);
    }

    public async Task<RawResponse<ListUsersPaginationResponse>> ListWithOffsetPaginationAsync(
        ListUsersOffsetPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
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
                            Path = "/inline-users",
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
                        var body = JsonUtils.Deserialize<ListUsersPaginationResponse>(
                            responseBody
                        )!;
                        return new RawResponse<ListUsersPaginationResponse>
                        {
                            Body = body,
                            StatusCode = response.StatusCode,
                            Headers = response.Raw.Headers,
                        };
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
            })
            .ConfigureAwait(false);
    }

    public async Task<RawResponse<ListUsersPaginationResponse>> ListWithDoubleOffsetPaginationAsync(
        ListUsersDoubleOffsetPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
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
                            Path = "/inline-users",
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
                        var body = JsonUtils.Deserialize<ListUsersPaginationResponse>(
                            responseBody
                        )!;
                        return new RawResponse<ListUsersPaginationResponse>
                        {
                            Body = body,
                            StatusCode = response.StatusCode,
                            Headers = response.Raw.Headers,
                        };
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
            })
            .ConfigureAwait(false);
    }

    public async Task<RawResponse<ListUsersPaginationResponse>> ListWithBodyOffsetPaginationAsync(
        ListUsersBodyOffsetPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var response = await _client
                    .SendRequestAsync(
                        new JsonRequest
                        {
                            BaseUrl = _client.Options.BaseUrl,
                            Method = HttpMethod.Post,
                            Path = "/inline-users",
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
                        var body = JsonUtils.Deserialize<ListUsersPaginationResponse>(
                            responseBody
                        )!;
                        return new RawResponse<ListUsersPaginationResponse>
                        {
                            Body = body,
                            StatusCode = response.StatusCode,
                            Headers = response.Raw.Headers,
                        };
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
            })
            .ConfigureAwait(false);
    }

    public async Task<RawResponse<ListUsersPaginationResponse>> ListWithOffsetStepPaginationAsync(
        ListUsersOffsetStepPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
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
                            Path = "/inline-users",
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
                        var body = JsonUtils.Deserialize<ListUsersPaginationResponse>(
                            responseBody
                        )!;
                        return new RawResponse<ListUsersPaginationResponse>
                        {
                            Body = body,
                            StatusCode = response.StatusCode,
                            Headers = response.Raw.Headers,
                        };
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
            })
            .ConfigureAwait(false);
    }

    public async Task<
        RawResponse<ListUsersPaginationResponse>
    > ListWithOffsetPaginationHasNextPageAsync(
        ListWithOffsetPaginationHasNextPageRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
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
                            Path = "/inline-users",
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
                        var body = JsonUtils.Deserialize<ListUsersPaginationResponse>(
                            responseBody
                        )!;
                        return new RawResponse<ListUsersPaginationResponse>
                        {
                            Body = body,
                            StatusCode = response.StatusCode,
                            Headers = response.Raw.Headers,
                        };
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
            })
            .ConfigureAwait(false);
    }

    public async Task<RawResponse<ListUsersExtendedResponse>> ListWithExtendedResultsAsync(
        ListUsersExtendedRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
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
                            Path = "/inline-users",
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
                        var body = JsonUtils.Deserialize<ListUsersExtendedResponse>(responseBody)!;
                        return new RawResponse<ListUsersExtendedResponse>
                        {
                            Body = body,
                            StatusCode = response.StatusCode,
                            Headers = response.Raw.Headers,
                        };
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
            })
            .ConfigureAwait(false);
    }

    public async Task<
        RawResponse<ListUsersExtendedOptionalListResponse>
    > ListWithExtendedResultsAndOptionalDataAsync(
        ListUsersExtendedRequestForOptionalData request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
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
                            Path = "/inline-users",
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
                        var body = JsonUtils.Deserialize<ListUsersExtendedOptionalListResponse>(
                            responseBody
                        )!;
                        return new RawResponse<ListUsersExtendedOptionalListResponse>
                        {
                            Body = body,
                            StatusCode = response.StatusCode,
                            Headers = response.Raw.Headers,
                        };
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
            })
            .ConfigureAwait(false);
    }

    public async Task<RawResponse<UsernameCursor>> ListUsernamesAsync(
        ListUsernamesRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
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
                            Path = "/inline-users",
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
                        var body = JsonUtils.Deserialize<UsernameCursor>(responseBody)!;
                        return new RawResponse<UsernameCursor>
                        {
                            Body = body,
                            StatusCode = response.StatusCode,
                            Headers = response.Raw.Headers,
                        };
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
            })
            .ConfigureAwait(false);
    }

    public async Task<RawResponse<UsernameContainer>> ListWithGlobalConfigAsync(
        ListWithGlobalConfigRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
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
                            Path = "/inline-users",
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
                        var body = JsonUtils.Deserialize<UsernameContainer>(responseBody)!;
                        return new RawResponse<UsernameContainer>
                        {
                            Body = body,
                            StatusCode = response.StatusCode,
                            Headers = response.Raw.Headers,
                        };
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
            })
            .ConfigureAwait(false);
    }
}
