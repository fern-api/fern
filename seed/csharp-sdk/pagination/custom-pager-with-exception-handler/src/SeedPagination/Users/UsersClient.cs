using System.Text.Json;
using SeedPagination.Core;

namespace SeedPagination;

public partial class UsersClient : IUsersClient
{
    private RawClient _client;

    internal UsersClient(RawClient client)
    {
        try
        {
            _client = client;
        }
        catch (Exception ex)
        {
            client.Options.ExceptionHandler?.CaptureException(ex);
            throw;
        }
    }

    private WithRawResponseTask<ListUsersPaginationResponse> ListWithCursorPaginationInternalAsync(
        ListUsersCursorPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<ListUsersPaginationResponse>(
            ListWithCursorPaginationInternalAsyncCore(request, options, cancellationToken)
        );
    }

    private async Task<
        WithRawResponse<ListUsersPaginationResponse>
    > ListWithCursorPaginationInternalAsyncCore(
        ListUsersCursorPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var _queryBuilder = new SeedPagination.Core.QueryStringBuilder.Builder(capacity: 4);
                if (request.Page != null)
                {
                    _queryBuilder.Add("page", request.Page);
                }
                if (request.PerPage != null)
                {
                    _queryBuilder.Add("per_page", request.PerPage);
                }
                if (request.Order != null)
                {
                    _queryBuilder.Add("order", request.Order);
                }
                if (request.StartingAfter != null)
                {
                    _queryBuilder.Add("starting_after", request.StartingAfter);
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
                            Path = "/users",
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
                        var responseData = JsonUtils.Deserialize<ListUsersPaginationResponse>(
                            responseBody
                        )!;
                        return new WithRawResponse<ListUsersPaginationResponse>()
                        {
                            Data = responseData,
                            RawResponse = new RawResponse()
                            {
                                StatusCode = response.Raw.StatusCode,
                                Url =
                                    response.Raw.RequestMessage?.RequestUri
                                    ?? new Uri("about:blank"),
                                Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                            },
                        };
                    }
                    catch (JsonException e)
                    {
                        throw new SeedPaginationApiException(
                            "Failed to deserialize response",
                            response.StatusCode,
                            responseBody,
                            e
                        );
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

    private WithRawResponseTask<ListUsersMixedTypePaginationResponse> ListWithMixedTypeCursorPaginationInternalAsync(
        ListUsersMixedTypeCursorPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<ListUsersMixedTypePaginationResponse>(
            ListWithMixedTypeCursorPaginationInternalAsyncCore(request, options, cancellationToken)
        );
    }

    private async Task<
        WithRawResponse<ListUsersMixedTypePaginationResponse>
    > ListWithMixedTypeCursorPaginationInternalAsyncCore(
        ListUsersMixedTypeCursorPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var _queryBuilder = new SeedPagination.Core.QueryStringBuilder.Builder(capacity: 1);
                if (request.Cursor != null)
                {
                    _queryBuilder.Add("cursor", request.Cursor);
                }
                var _queryString = _queryBuilder
                    .MergeAdditional(options?.AdditionalQueryParameters)
                    .Build();
                var response = await _client
                    .SendRequestAsync(
                        new JsonRequest
                        {
                            BaseUrl = _client.Options.BaseUrl,
                            Method = HttpMethod.Post,
                            Path = "/users",
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
                        var responseData =
                            JsonUtils.Deserialize<ListUsersMixedTypePaginationResponse>(
                                responseBody
                            )!;
                        return new WithRawResponse<ListUsersMixedTypePaginationResponse>()
                        {
                            Data = responseData,
                            RawResponse = new RawResponse()
                            {
                                StatusCode = response.Raw.StatusCode,
                                Url =
                                    response.Raw.RequestMessage?.RequestUri
                                    ?? new Uri("about:blank"),
                                Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                            },
                        };
                    }
                    catch (JsonException e)
                    {
                        throw new SeedPaginationApiException(
                            "Failed to deserialize response",
                            response.StatusCode,
                            responseBody,
                            e
                        );
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

    private WithRawResponseTask<ListUsersPaginationResponse> ListWithBodyCursorPaginationInternalAsync(
        ListUsersBodyCursorPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<ListUsersPaginationResponse>(
            ListWithBodyCursorPaginationInternalAsyncCore(request, options, cancellationToken)
        );
    }

    private async Task<
        WithRawResponse<ListUsersPaginationResponse>
    > ListWithBodyCursorPaginationInternalAsyncCore(
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
                        var responseData = JsonUtils.Deserialize<ListUsersPaginationResponse>(
                            responseBody
                        )!;
                        return new WithRawResponse<ListUsersPaginationResponse>()
                        {
                            Data = responseData,
                            RawResponse = new RawResponse()
                            {
                                StatusCode = response.Raw.StatusCode,
                                Url =
                                    response.Raw.RequestMessage?.RequestUri
                                    ?? new Uri("about:blank"),
                                Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                            },
                        };
                    }
                    catch (JsonException e)
                    {
                        throw new SeedPaginationApiException(
                            "Failed to deserialize response",
                            response.StatusCode,
                            responseBody,
                            e
                        );
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

    /// <summary>
    /// Pagination endpoint with a top-level cursor field in the request body.
    /// This tests that the mock server correctly ignores cursor mismatches
    /// when getNextPage() is called with a different cursor value.
    /// </summary>
    private WithRawResponseTask<ListUsersTopLevelCursorPaginationResponse> ListWithTopLevelBodyCursorPaginationInternalAsync(
        ListUsersTopLevelBodyCursorPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<ListUsersTopLevelCursorPaginationResponse>(
            ListWithTopLevelBodyCursorPaginationInternalAsyncCore(
                request,
                options,
                cancellationToken
            )
        );
    }

    private async Task<
        WithRawResponse<ListUsersTopLevelCursorPaginationResponse>
    > ListWithTopLevelBodyCursorPaginationInternalAsyncCore(
        ListUsersTopLevelBodyCursorPaginationRequest request,
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
                            Path = "/users/top-level-cursor",
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
                        var responseData =
                            JsonUtils.Deserialize<ListUsersTopLevelCursorPaginationResponse>(
                                responseBody
                            )!;
                        return new WithRawResponse<ListUsersTopLevelCursorPaginationResponse>()
                        {
                            Data = responseData,
                            RawResponse = new RawResponse()
                            {
                                StatusCode = response.Raw.StatusCode,
                                Url =
                                    response.Raw.RequestMessage?.RequestUri
                                    ?? new Uri("about:blank"),
                                Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                            },
                        };
                    }
                    catch (JsonException e)
                    {
                        throw new SeedPaginationApiException(
                            "Failed to deserialize response",
                            response.StatusCode,
                            responseBody,
                            e
                        );
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

    private WithRawResponseTask<ListUsersPaginationResponse> ListWithOffsetPaginationInternalAsync(
        ListUsersOffsetPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<ListUsersPaginationResponse>(
            ListWithOffsetPaginationInternalAsyncCore(request, options, cancellationToken)
        );
    }

    private async Task<
        WithRawResponse<ListUsersPaginationResponse>
    > ListWithOffsetPaginationInternalAsyncCore(
        ListUsersOffsetPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var _queryBuilder = new SeedPagination.Core.QueryStringBuilder.Builder(capacity: 4);
                if (request.Page != null)
                {
                    _queryBuilder.Add("page", request.Page);
                }
                if (request.PerPage != null)
                {
                    _queryBuilder.Add("per_page", request.PerPage);
                }
                if (request.Order != null)
                {
                    _queryBuilder.Add("order", request.Order);
                }
                if (request.StartingAfter != null)
                {
                    _queryBuilder.Add("starting_after", request.StartingAfter);
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
                            Path = "/users",
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
                        var responseData = JsonUtils.Deserialize<ListUsersPaginationResponse>(
                            responseBody
                        )!;
                        return new WithRawResponse<ListUsersPaginationResponse>()
                        {
                            Data = responseData,
                            RawResponse = new RawResponse()
                            {
                                StatusCode = response.Raw.StatusCode,
                                Url =
                                    response.Raw.RequestMessage?.RequestUri
                                    ?? new Uri("about:blank"),
                                Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                            },
                        };
                    }
                    catch (JsonException e)
                    {
                        throw new SeedPaginationApiException(
                            "Failed to deserialize response",
                            response.StatusCode,
                            responseBody,
                            e
                        );
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

    private WithRawResponseTask<ListUsersPaginationResponse> ListWithDoubleOffsetPaginationInternalAsync(
        ListUsersDoubleOffsetPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<ListUsersPaginationResponse>(
            ListWithDoubleOffsetPaginationInternalAsyncCore(request, options, cancellationToken)
        );
    }

    private async Task<
        WithRawResponse<ListUsersPaginationResponse>
    > ListWithDoubleOffsetPaginationInternalAsyncCore(
        ListUsersDoubleOffsetPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var _queryBuilder = new SeedPagination.Core.QueryStringBuilder.Builder(capacity: 4);
                if (request.Page != null)
                {
                    _queryBuilder.Add("page", request.Page);
                }
                if (request.PerPage != null)
                {
                    _queryBuilder.Add("per_page", request.PerPage);
                }
                if (request.Order != null)
                {
                    _queryBuilder.Add("order", request.Order);
                }
                if (request.StartingAfter != null)
                {
                    _queryBuilder.Add("starting_after", request.StartingAfter);
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
                            Path = "/users",
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
                        var responseData = JsonUtils.Deserialize<ListUsersPaginationResponse>(
                            responseBody
                        )!;
                        return new WithRawResponse<ListUsersPaginationResponse>()
                        {
                            Data = responseData,
                            RawResponse = new RawResponse()
                            {
                                StatusCode = response.Raw.StatusCode,
                                Url =
                                    response.Raw.RequestMessage?.RequestUri
                                    ?? new Uri("about:blank"),
                                Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                            },
                        };
                    }
                    catch (JsonException e)
                    {
                        throw new SeedPaginationApiException(
                            "Failed to deserialize response",
                            response.StatusCode,
                            responseBody,
                            e
                        );
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

    private WithRawResponseTask<ListUsersPaginationResponse> ListWithBodyOffsetPaginationInternalAsync(
        ListUsersBodyOffsetPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<ListUsersPaginationResponse>(
            ListWithBodyOffsetPaginationInternalAsyncCore(request, options, cancellationToken)
        );
    }

    private async Task<
        WithRawResponse<ListUsersPaginationResponse>
    > ListWithBodyOffsetPaginationInternalAsyncCore(
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
                        var responseData = JsonUtils.Deserialize<ListUsersPaginationResponse>(
                            responseBody
                        )!;
                        return new WithRawResponse<ListUsersPaginationResponse>()
                        {
                            Data = responseData,
                            RawResponse = new RawResponse()
                            {
                                StatusCode = response.Raw.StatusCode,
                                Url =
                                    response.Raw.RequestMessage?.RequestUri
                                    ?? new Uri("about:blank"),
                                Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                            },
                        };
                    }
                    catch (JsonException e)
                    {
                        throw new SeedPaginationApiException(
                            "Failed to deserialize response",
                            response.StatusCode,
                            responseBody,
                            e
                        );
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

    private WithRawResponseTask<ListUsersPaginationResponse> ListWithOffsetStepPaginationInternalAsync(
        ListUsersOffsetStepPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<ListUsersPaginationResponse>(
            ListWithOffsetStepPaginationInternalAsyncCore(request, options, cancellationToken)
        );
    }

    private async Task<
        WithRawResponse<ListUsersPaginationResponse>
    > ListWithOffsetStepPaginationInternalAsyncCore(
        ListUsersOffsetStepPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var _queryBuilder = new SeedPagination.Core.QueryStringBuilder.Builder(capacity: 3);
                if (request.Page != null)
                {
                    _queryBuilder.Add("page", request.Page);
                }
                if (request.Limit != null)
                {
                    _queryBuilder.Add("limit", request.Limit);
                }
                if (request.Order != null)
                {
                    _queryBuilder.Add("order", request.Order);
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
                            Path = "/users",
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
                        var responseData = JsonUtils.Deserialize<ListUsersPaginationResponse>(
                            responseBody
                        )!;
                        return new WithRawResponse<ListUsersPaginationResponse>()
                        {
                            Data = responseData,
                            RawResponse = new RawResponse()
                            {
                                StatusCode = response.Raw.StatusCode,
                                Url =
                                    response.Raw.RequestMessage?.RequestUri
                                    ?? new Uri("about:blank"),
                                Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                            },
                        };
                    }
                    catch (JsonException e)
                    {
                        throw new SeedPaginationApiException(
                            "Failed to deserialize response",
                            response.StatusCode,
                            responseBody,
                            e
                        );
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

    private WithRawResponseTask<ListUsersPaginationResponse> ListWithOffsetPaginationHasNextPageInternalAsync(
        ListWithOffsetPaginationHasNextPageRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<ListUsersPaginationResponse>(
            ListWithOffsetPaginationHasNextPageInternalAsyncCore(
                request,
                options,
                cancellationToken
            )
        );
    }

    private async Task<
        WithRawResponse<ListUsersPaginationResponse>
    > ListWithOffsetPaginationHasNextPageInternalAsyncCore(
        ListWithOffsetPaginationHasNextPageRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var _queryBuilder = new SeedPagination.Core.QueryStringBuilder.Builder(capacity: 3);
                if (request.Page != null)
                {
                    _queryBuilder.Add("page", request.Page);
                }
                if (request.Limit != null)
                {
                    _queryBuilder.Add("limit", request.Limit);
                }
                if (request.Order != null)
                {
                    _queryBuilder.Add("order", request.Order);
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
                            Path = "/users",
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
                        var responseData = JsonUtils.Deserialize<ListUsersPaginationResponse>(
                            responseBody
                        )!;
                        return new WithRawResponse<ListUsersPaginationResponse>()
                        {
                            Data = responseData,
                            RawResponse = new RawResponse()
                            {
                                StatusCode = response.Raw.StatusCode,
                                Url =
                                    response.Raw.RequestMessage?.RequestUri
                                    ?? new Uri("about:blank"),
                                Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                            },
                        };
                    }
                    catch (JsonException e)
                    {
                        throw new SeedPaginationApiException(
                            "Failed to deserialize response",
                            response.StatusCode,
                            responseBody,
                            e
                        );
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

    private WithRawResponseTask<ListUsersExtendedResponse> ListWithExtendedResultsInternalAsync(
        ListUsersExtendedRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<ListUsersExtendedResponse>(
            ListWithExtendedResultsInternalAsyncCore(request, options, cancellationToken)
        );
    }

    private async Task<
        WithRawResponse<ListUsersExtendedResponse>
    > ListWithExtendedResultsInternalAsyncCore(
        ListUsersExtendedRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var _queryBuilder = new SeedPagination.Core.QueryStringBuilder.Builder(capacity: 1);
                if (request.Cursor != null)
                {
                    _queryBuilder.Add("cursor", request.Cursor);
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
                            Path = "/users",
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
                        var responseData = JsonUtils.Deserialize<ListUsersExtendedResponse>(
                            responseBody
                        )!;
                        return new WithRawResponse<ListUsersExtendedResponse>()
                        {
                            Data = responseData,
                            RawResponse = new RawResponse()
                            {
                                StatusCode = response.Raw.StatusCode,
                                Url =
                                    response.Raw.RequestMessage?.RequestUri
                                    ?? new Uri("about:blank"),
                                Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                            },
                        };
                    }
                    catch (JsonException e)
                    {
                        throw new SeedPaginationApiException(
                            "Failed to deserialize response",
                            response.StatusCode,
                            responseBody,
                            e
                        );
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

    private WithRawResponseTask<ListUsersExtendedOptionalListResponse> ListWithExtendedResultsAndOptionalDataInternalAsync(
        ListUsersExtendedRequestForOptionalData request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<ListUsersExtendedOptionalListResponse>(
            ListWithExtendedResultsAndOptionalDataInternalAsyncCore(
                request,
                options,
                cancellationToken
            )
        );
    }

    private async Task<
        WithRawResponse<ListUsersExtendedOptionalListResponse>
    > ListWithExtendedResultsAndOptionalDataInternalAsyncCore(
        ListUsersExtendedRequestForOptionalData request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var _queryBuilder = new SeedPagination.Core.QueryStringBuilder.Builder(capacity: 1);
                if (request.Cursor != null)
                {
                    _queryBuilder.Add("cursor", request.Cursor);
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
                            Path = "/users",
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
                        var responseData =
                            JsonUtils.Deserialize<ListUsersExtendedOptionalListResponse>(
                                responseBody
                            )!;
                        return new WithRawResponse<ListUsersExtendedOptionalListResponse>()
                        {
                            Data = responseData,
                            RawResponse = new RawResponse()
                            {
                                StatusCode = response.Raw.StatusCode,
                                Url =
                                    response.Raw.RequestMessage?.RequestUri
                                    ?? new Uri("about:blank"),
                                Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                            },
                        };
                    }
                    catch (JsonException e)
                    {
                        throw new SeedPaginationApiException(
                            "Failed to deserialize response",
                            response.StatusCode,
                            responseBody,
                            e
                        );
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

    private WithRawResponseTask<UsernameCursor> ListUsernamesInternalAsync(
        ListUsernamesRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<UsernameCursor>(
            ListUsernamesInternalAsyncCore(request, options, cancellationToken)
        );
    }

    private async Task<WithRawResponse<UsernameCursor>> ListUsernamesInternalAsyncCore(
        ListUsernamesRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var _queryBuilder = new SeedPagination.Core.QueryStringBuilder.Builder(capacity: 1);
                if (request.StartingAfter != null)
                {
                    _queryBuilder.Add("starting_after", request.StartingAfter);
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
                            Path = "/users",
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
                        var responseData = JsonUtils.Deserialize<UsernameCursor>(responseBody)!;
                        return new WithRawResponse<UsernameCursor>()
                        {
                            Data = responseData,
                            RawResponse = new RawResponse()
                            {
                                StatusCode = response.Raw.StatusCode,
                                Url =
                                    response.Raw.RequestMessage?.RequestUri
                                    ?? new Uri("about:blank"),
                                Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                            },
                        };
                    }
                    catch (JsonException e)
                    {
                        throw new SeedPaginationApiException(
                            "Failed to deserialize response",
                            response.StatusCode,
                            responseBody,
                            e
                        );
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

    private WithRawResponseTask<UsernameCursor?> ListUsernamesWithOptionalResponseInternalAsync(
        ListUsernamesWithOptionalResponseRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<UsernameCursor?>(
            ListUsernamesWithOptionalResponseInternalAsyncCore(request, options, cancellationToken)
        );
    }

    private async Task<
        WithRawResponse<UsernameCursor?>
    > ListUsernamesWithOptionalResponseInternalAsyncCore(
        ListUsernamesWithOptionalResponseRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var _queryBuilder = new SeedPagination.Core.QueryStringBuilder.Builder(capacity: 1);
                if (request.StartingAfter != null)
                {
                    _queryBuilder.Add("starting_after", request.StartingAfter);
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
                            Path = "/users",
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
                        var responseData = JsonUtils.Deserialize<UsernameCursor?>(responseBody)!;
                        return new WithRawResponse<UsernameCursor?>()
                        {
                            Data = responseData,
                            RawResponse = new RawResponse()
                            {
                                StatusCode = response.Raw.StatusCode,
                                Url =
                                    response.Raw.RequestMessage?.RequestUri
                                    ?? new Uri("about:blank"),
                                Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                            },
                        };
                    }
                    catch (JsonException e)
                    {
                        throw new SeedPaginationApiException(
                            "Failed to deserialize response",
                            response.StatusCode,
                            responseBody,
                            e
                        );
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

    private WithRawResponseTask<UsernameContainer> ListWithGlobalConfigInternalAsync(
        ListWithGlobalConfigRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<UsernameContainer>(
            ListWithGlobalConfigInternalAsyncCore(request, options, cancellationToken)
        );
    }

    private async Task<WithRawResponse<UsernameContainer>> ListWithGlobalConfigInternalAsyncCore(
        ListWithGlobalConfigRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var _queryBuilder = new SeedPagination.Core.QueryStringBuilder.Builder(capacity: 1);
                if (request.Offset != null)
                {
                    _queryBuilder.Add("offset", request.Offset);
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
                            Path = "/users",
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
                        var responseData = JsonUtils.Deserialize<UsernameContainer>(responseBody)!;
                        return new WithRawResponse<UsernameContainer>()
                        {
                            Data = responseData,
                            RawResponse = new RawResponse()
                            {
                                StatusCode = response.Raw.StatusCode,
                                Url =
                                    response.Raw.RequestMessage?.RequestUri
                                    ?? new Uri("about:blank"),
                                Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                            },
                        };
                    }
                    catch (JsonException e)
                    {
                        throw new SeedPaginationApiException(
                            "Failed to deserialize response",
                            response.StatusCode,
                            responseBody,
                            e
                        );
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

    private WithRawResponseTask<ListUsersOptionalDataPaginationResponse> ListWithOptionalDataInternalAsync(
        ListUsersOptionalDataRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<ListUsersOptionalDataPaginationResponse>(
            ListWithOptionalDataInternalAsyncCore(request, options, cancellationToken)
        );
    }

    private async Task<
        WithRawResponse<ListUsersOptionalDataPaginationResponse>
    > ListWithOptionalDataInternalAsyncCore(
        ListUsersOptionalDataRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var _queryBuilder = new SeedPagination.Core.QueryStringBuilder.Builder(capacity: 1);
                if (request.Page != null)
                {
                    _queryBuilder.Add("page", request.Page);
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
                            Path = "/users/optional-data",
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
                        var responseData =
                            JsonUtils.Deserialize<ListUsersOptionalDataPaginationResponse>(
                                responseBody
                            )!;
                        return new WithRawResponse<ListUsersOptionalDataPaginationResponse>()
                        {
                            Data = responseData,
                            RawResponse = new RawResponse()
                            {
                                StatusCode = response.Raw.StatusCode,
                                Url =
                                    response.Raw.RequestMessage?.RequestUri
                                    ?? new Uri("about:blank"),
                                Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                            },
                        };
                    }
                    catch (JsonException e)
                    {
                        throw new SeedPaginationApiException(
                            "Failed to deserialize response",
                            response.StatusCode,
                            responseBody,
                            e
                        );
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
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
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
                        async (request, options, cancellationToken) =>
                            await ListWithCursorPaginationInternalAsync(
                                request,
                                options,
                                cancellationToken
                            ),
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
            })
            .ConfigureAwait(false);
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
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
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
                        async (request, options, cancellationToken) =>
                            await ListWithMixedTypeCursorPaginationInternalAsync(
                                request,
                                options,
                                cancellationToken
                            ),
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
            })
            .ConfigureAwait(false);
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
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
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
                        async (request, options, cancellationToken) =>
                            await ListWithBodyCursorPaginationInternalAsync(
                                request,
                                options,
                                cancellationToken
                            ),
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
            })
            .ConfigureAwait(false);
    }

    /// <summary>
    /// Pagination endpoint with a top-level cursor field in the request body.
    /// This tests that the mock server correctly ignores cursor mismatches
    /// when getNextPage() is called with a different cursor value.
    /// </summary>
    /// <example><code>
    /// await client.Users.ListWithTopLevelBodyCursorPaginationAsync(
    ///     new ListUsersTopLevelBodyCursorPaginationRequest
    ///     {
    ///         Cursor = "initial_cursor",
    ///         Filter = "active",
    ///     }
    /// );
    /// </code></example>
    public async Task<Pager<User>> ListWithTopLevelBodyCursorPaginationAsync(
        ListUsersTopLevelBodyCursorPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                if (request is not null)
                {
                    request = request with { };
                }
                var pager = await CursorPager<
                    ListUsersTopLevelBodyCursorPaginationRequest,
                    RequestOptions?,
                    ListUsersTopLevelCursorPaginationResponse,
                    string?,
                    User
                >
                    .CreateInstanceAsync(
                        request,
                        options,
                        async (request, options, cancellationToken) =>
                            await ListWithTopLevelBodyCursorPaginationInternalAsync(
                                request,
                                options,
                                cancellationToken
                            ),
                        (request, cursor) =>
                        {
                            request.Cursor = cursor;
                        },
                        response => response.NextCursor,
                        response => response.Data?.ToList(),
                        cancellationToken
                    )
                    .ConfigureAwait(false);
                return pager;
            })
            .ConfigureAwait(false);
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
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
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
                        async (request, options, cancellationToken) =>
                            await ListWithOffsetPaginationInternalAsync(
                                request,
                                options,
                                cancellationToken
                            ),
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
            })
            .ConfigureAwait(false);
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
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
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
                        async (request, options, cancellationToken) =>
                            await ListWithDoubleOffsetPaginationInternalAsync(
                                request,
                                options,
                                cancellationToken
                            ),
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
            })
            .ConfigureAwait(false);
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
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
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
                        async (request, options, cancellationToken) =>
                            await ListWithBodyOffsetPaginationInternalAsync(
                                request,
                                options,
                                cancellationToken
                            ),
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
            })
            .ConfigureAwait(false);
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
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
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
                        async (request, options, cancellationToken) =>
                            await ListWithOffsetStepPaginationInternalAsync(
                                request,
                                options,
                                cancellationToken
                            ),
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
            })
            .ConfigureAwait(false);
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
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
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
                        async (request, options, cancellationToken) =>
                            await ListWithOffsetPaginationHasNextPageInternalAsync(
                                request,
                                options,
                                cancellationToken
                            ),
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
            })
            .ConfigureAwait(false);
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
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
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
                        async (request, options, cancellationToken) =>
                            await ListWithExtendedResultsInternalAsync(
                                request,
                                options,
                                cancellationToken
                            ),
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
            })
            .ConfigureAwait(false);
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
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
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
                        async (request, options, cancellationToken) =>
                            await ListWithExtendedResultsAndOptionalDataInternalAsync(
                                request,
                                options,
                                cancellationToken
                            ),
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
            })
            .ConfigureAwait(false);
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
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
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
                        async (request, options, cancellationToken) =>
                            await ListUsernamesInternalAsync(request, options, cancellationToken),
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
            })
            .ConfigureAwait(false);
    }

    /// <example><code>
    /// await client.Users.ListUsernamesWithOptionalResponseAsync(
    ///     new ListUsernamesWithOptionalResponseRequest { StartingAfter = "starting_after" }
    /// );
    /// </code></example>
    public async Task<Pager<string>> ListUsernamesWithOptionalResponseAsync(
        ListUsernamesWithOptionalResponseRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                if (request is not null)
                {
                    request = request with { };
                }
                var pager = await CursorPager<
                    ListUsernamesWithOptionalResponseRequest,
                    RequestOptions?,
                    UsernameCursor?,
                    string?,
                    string
                >
                    .CreateInstanceAsync(
                        request,
                        options,
                        async (request, options, cancellationToken) =>
                            await ListUsernamesWithOptionalResponseInternalAsync(
                                request,
                                options,
                                cancellationToken
                            ),
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
            })
            .ConfigureAwait(false);
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
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
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
                        async (request, options, cancellationToken) =>
                            await ListWithGlobalConfigInternalAsync(
                                request,
                                options,
                                cancellationToken
                            ),
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
            })
            .ConfigureAwait(false);
    }

    /// <example><code>
    /// await client.Users.ListWithOptionalDataAsync(new ListUsersOptionalDataRequest { Page = 1 });
    /// </code></example>
    public async Task<Pager<User>> ListWithOptionalDataAsync(
        ListUsersOptionalDataRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                request = request with { };
                var pager = await OffsetPager<
                    ListUsersOptionalDataRequest,
                    RequestOptions?,
                    ListUsersOptionalDataPaginationResponse,
                    int?,
                    object,
                    User
                >
                    .CreateInstanceAsync(
                        request,
                        options,
                        async (request, options, cancellationToken) =>
                            await ListWithOptionalDataInternalAsync(
                                request,
                                options,
                                cancellationToken
                            ),
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
            })
            .ConfigureAwait(false);
    }
}
