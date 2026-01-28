using System.Text.Json;
using SeedPagination;
using SeedPagination.Core;

namespace SeedPagination.InlineUsers;

public partial class InlineUsersClient_ : IInlineUsersClient_
{
    private RawClient _client;

    internal InlineUsersClient_(RawClient client)
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
                var _queryString = new SeedPagination.Core.QueryStringBuilder.Builder(capacity: 4)
                    .Add("page", request.Page)
                    .Add("per_page", request.PerPage)
                    .Add("order", request.Order)
                    .Add("starting_after", request.StartingAfter)
                    .MergeAdditional(options?.AdditionalQueryParameters)
                    .Build();
                var _headers = await new SeedPagination.Core.HeadersBuilder.Builder()
                    .AddWithoutAuth(_client.Options.Headers)
                    .Add(_client.Options.AdditionalHeaders)
                    .Add(options?.AdditionalHeaders)
                    .BuildAsync()
                    .ConfigureAwait(false);
                var response = await _client
                    .SendRequestAsync(
                        new JsonRequest
                        {
                            BaseUrl = _client.Options.BaseUrl,
                            Method = HttpMethod.Get,
                            Path = "/inline-users",
                            QueryString = _queryString,
                            Headers = _headers,
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
                var _queryString = new SeedPagination.Core.QueryStringBuilder.Builder(capacity: 1)
                    .Add("cursor", request.Cursor)
                    .MergeAdditional(options?.AdditionalQueryParameters)
                    .Build();
                var _headers = await new SeedPagination.Core.HeadersBuilder.Builder()
                    .AddWithoutAuth(_client.Options.Headers)
                    .Add(_client.Options.AdditionalHeaders)
                    .Add(options?.AdditionalHeaders)
                    .BuildAsync()
                    .ConfigureAwait(false);
                var response = await _client
                    .SendRequestAsync(
                        new JsonRequest
                        {
                            BaseUrl = _client.Options.BaseUrl,
                            Method = HttpMethod.Post,
                            Path = "/inline-users",
                            QueryString = _queryString,
                            Headers = _headers,
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
                var _headers = await new SeedPagination.Core.HeadersBuilder.Builder()
                    .AddWithoutAuth(_client.Options.Headers)
                    .Add(_client.Options.AdditionalHeaders)
                    .Add(options?.AdditionalHeaders)
                    .BuildAsync()
                    .ConfigureAwait(false);
                var response = await _client
                    .SendRequestAsync(
                        new JsonRequest
                        {
                            BaseUrl = _client.Options.BaseUrl,
                            Method = HttpMethod.Post,
                            Path = "/inline-users",
                            Body = request,
                            Headers = _headers,
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
                var _queryString = new SeedPagination.Core.QueryStringBuilder.Builder(capacity: 4)
                    .Add("page", request.Page)
                    .Add("per_page", request.PerPage)
                    .Add("order", request.Order)
                    .Add("starting_after", request.StartingAfter)
                    .MergeAdditional(options?.AdditionalQueryParameters)
                    .Build();
                var _headers = await new SeedPagination.Core.HeadersBuilder.Builder()
                    .AddWithoutAuth(_client.Options.Headers)
                    .Add(_client.Options.AdditionalHeaders)
                    .Add(options?.AdditionalHeaders)
                    .BuildAsync()
                    .ConfigureAwait(false);
                var response = await _client
                    .SendRequestAsync(
                        new JsonRequest
                        {
                            BaseUrl = _client.Options.BaseUrl,
                            Method = HttpMethod.Get,
                            Path = "/inline-users",
                            QueryString = _queryString,
                            Headers = _headers,
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
                var _queryString = new SeedPagination.Core.QueryStringBuilder.Builder(capacity: 4)
                    .Add("page", request.Page)
                    .Add("per_page", request.PerPage)
                    .Add("order", request.Order)
                    .Add("starting_after", request.StartingAfter)
                    .MergeAdditional(options?.AdditionalQueryParameters)
                    .Build();
                var _headers = await new SeedPagination.Core.HeadersBuilder.Builder()
                    .AddWithoutAuth(_client.Options.Headers)
                    .Add(_client.Options.AdditionalHeaders)
                    .Add(options?.AdditionalHeaders)
                    .BuildAsync()
                    .ConfigureAwait(false);
                var response = await _client
                    .SendRequestAsync(
                        new JsonRequest
                        {
                            BaseUrl = _client.Options.BaseUrl,
                            Method = HttpMethod.Get,
                            Path = "/inline-users",
                            QueryString = _queryString,
                            Headers = _headers,
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
                var _headers = await new SeedPagination.Core.HeadersBuilder.Builder()
                    .AddWithoutAuth(_client.Options.Headers)
                    .Add(_client.Options.AdditionalHeaders)
                    .Add(options?.AdditionalHeaders)
                    .BuildAsync()
                    .ConfigureAwait(false);
                var response = await _client
                    .SendRequestAsync(
                        new JsonRequest
                        {
                            BaseUrl = _client.Options.BaseUrl,
                            Method = HttpMethod.Post,
                            Path = "/inline-users",
                            Body = request,
                            Headers = _headers,
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
                var _queryString = new SeedPagination.Core.QueryStringBuilder.Builder(capacity: 3)
                    .Add("page", request.Page)
                    .Add("limit", request.Limit)
                    .Add("order", request.Order)
                    .MergeAdditional(options?.AdditionalQueryParameters)
                    .Build();
                var _headers = await new SeedPagination.Core.HeadersBuilder.Builder()
                    .AddWithoutAuth(_client.Options.Headers)
                    .Add(_client.Options.AdditionalHeaders)
                    .Add(options?.AdditionalHeaders)
                    .BuildAsync()
                    .ConfigureAwait(false);
                var response = await _client
                    .SendRequestAsync(
                        new JsonRequest
                        {
                            BaseUrl = _client.Options.BaseUrl,
                            Method = HttpMethod.Get,
                            Path = "/inline-users",
                            QueryString = _queryString,
                            Headers = _headers,
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
                var _queryString = new SeedPagination.Core.QueryStringBuilder.Builder(capacity: 3)
                    .Add("page", request.Page)
                    .Add("limit", request.Limit)
                    .Add("order", request.Order)
                    .MergeAdditional(options?.AdditionalQueryParameters)
                    .Build();
                var _headers = await new SeedPagination.Core.HeadersBuilder.Builder()
                    .AddWithoutAuth(_client.Options.Headers)
                    .Add(_client.Options.AdditionalHeaders)
                    .Add(options?.AdditionalHeaders)
                    .BuildAsync()
                    .ConfigureAwait(false);
                var response = await _client
                    .SendRequestAsync(
                        new JsonRequest
                        {
                            BaseUrl = _client.Options.BaseUrl,
                            Method = HttpMethod.Get,
                            Path = "/inline-users",
                            QueryString = _queryString,
                            Headers = _headers,
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
                var _queryString = new SeedPagination.Core.QueryStringBuilder.Builder(capacity: 1)
                    .Add("cursor", request.Cursor)
                    .MergeAdditional(options?.AdditionalQueryParameters)
                    .Build();
                var _headers = await new SeedPagination.Core.HeadersBuilder.Builder()
                    .AddWithoutAuth(_client.Options.Headers)
                    .Add(_client.Options.AdditionalHeaders)
                    .Add(options?.AdditionalHeaders)
                    .BuildAsync()
                    .ConfigureAwait(false);
                var response = await _client
                    .SendRequestAsync(
                        new JsonRequest
                        {
                            BaseUrl = _client.Options.BaseUrl,
                            Method = HttpMethod.Get,
                            Path = "/inline-users",
                            QueryString = _queryString,
                            Headers = _headers,
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
                var _queryString = new SeedPagination.Core.QueryStringBuilder.Builder(capacity: 1)
                    .Add("cursor", request.Cursor)
                    .MergeAdditional(options?.AdditionalQueryParameters)
                    .Build();
                var _headers = await new SeedPagination.Core.HeadersBuilder.Builder()
                    .AddWithoutAuth(_client.Options.Headers)
                    .Add(_client.Options.AdditionalHeaders)
                    .Add(options?.AdditionalHeaders)
                    .BuildAsync()
                    .ConfigureAwait(false);
                var response = await _client
                    .SendRequestAsync(
                        new JsonRequest
                        {
                            BaseUrl = _client.Options.BaseUrl,
                            Method = HttpMethod.Get,
                            Path = "/inline-users",
                            QueryString = _queryString,
                            Headers = _headers,
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
                var _queryString = new SeedPagination.Core.QueryStringBuilder.Builder(capacity: 1)
                    .Add("starting_after", request.StartingAfter)
                    .MergeAdditional(options?.AdditionalQueryParameters)
                    .Build();
                var _headers = await new SeedPagination.Core.HeadersBuilder.Builder()
                    .AddWithoutAuth(_client.Options.Headers)
                    .Add(_client.Options.AdditionalHeaders)
                    .Add(options?.AdditionalHeaders)
                    .BuildAsync()
                    .ConfigureAwait(false);
                var response = await _client
                    .SendRequestAsync(
                        new JsonRequest
                        {
                            BaseUrl = _client.Options.BaseUrl,
                            Method = HttpMethod.Get,
                            Path = "/inline-users",
                            QueryString = _queryString,
                            Headers = _headers,
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
                var _queryString = new SeedPagination.Core.QueryStringBuilder.Builder(capacity: 1)
                    .Add("offset", request.Offset)
                    .MergeAdditional(options?.AdditionalQueryParameters)
                    .Build();
                var _headers = await new SeedPagination.Core.HeadersBuilder.Builder()
                    .AddWithoutAuth(_client.Options.Headers)
                    .Add(_client.Options.AdditionalHeaders)
                    .Add(options?.AdditionalHeaders)
                    .BuildAsync()
                    .ConfigureAwait(false);
                var response = await _client
                    .SendRequestAsync(
                        new JsonRequest
                        {
                            BaseUrl = _client.Options.BaseUrl,
                            Method = HttpMethod.Get,
                            Path = "/inline-users",
                            QueryString = _queryString,
                            Headers = _headers,
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

    /// <example><code>
    /// await client.InlineUsers.InlineUsers.ListWithCursorPaginationAsync(
    ///     new SeedPagination.InlineUsers.ListUsersCursorPaginationRequest
    ///     {
    ///         Page = 1,
    ///         PerPage = 1,
    ///         Order = SeedPagination.InlineUsers.Order.Asc,
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
                        response => response.Data.Users_?.ToList(),
                        cancellationToken
                    )
                    .ConfigureAwait(false);
                return pager;
            })
            .ConfigureAwait(false);
    }

    /// <example><code>
    /// await client.InlineUsers.InlineUsers.ListWithMixedTypeCursorPaginationAsync(
    ///     new SeedPagination.InlineUsers.ListUsersMixedTypeCursorPaginationRequest { Cursor = "cursor" }
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
                        response => response.Data.Users_?.ToList(),
                        cancellationToken
                    )
                    .ConfigureAwait(false);
                return pager;
            })
            .ConfigureAwait(false);
    }

    /// <example><code>
    /// await client.InlineUsers.InlineUsers.ListWithBodyCursorPaginationAsync(
    ///     new SeedPagination.InlineUsers.ListUsersBodyCursorPaginationRequest
    ///     {
    ///         Pagination = new SeedPagination.InlineUsers.WithCursor { Cursor = "cursor" },
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
                        response => response.Data.Users_?.ToList(),
                        cancellationToken
                    )
                    .ConfigureAwait(false);
                return pager;
            })
            .ConfigureAwait(false);
    }

    /// <example><code>
    /// await client.InlineUsers.InlineUsers.ListWithOffsetPaginationAsync(
    ///     new SeedPagination.InlineUsers.ListUsersOffsetPaginationRequest
    ///     {
    ///         Page = 1,
    ///         PerPage = 1,
    ///         Order = SeedPagination.InlineUsers.Order.Asc,
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
                        response => response.Data.Users_?.ToList(),
                        null,
                        cancellationToken
                    )
                    .ConfigureAwait(false);
                return pager;
            })
            .ConfigureAwait(false);
    }

    /// <example><code>
    /// await client.InlineUsers.InlineUsers.ListWithDoubleOffsetPaginationAsync(
    ///     new SeedPagination.InlineUsers.ListUsersDoubleOffsetPaginationRequest
    ///     {
    ///         Page = 1.1,
    ///         PerPage = 1.1,
    ///         Order = SeedPagination.InlineUsers.Order.Asc,
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
                        response => response.Data.Users_?.ToList(),
                        null,
                        cancellationToken
                    )
                    .ConfigureAwait(false);
                return pager;
            })
            .ConfigureAwait(false);
    }

    /// <example><code>
    /// await client.InlineUsers.InlineUsers.ListWithBodyOffsetPaginationAsync(
    ///     new SeedPagination.InlineUsers.ListUsersBodyOffsetPaginationRequest
    ///     {
    ///         Pagination = new SeedPagination.InlineUsers.WithPage { Page = 1 },
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
                        response => response.Data.Users_?.ToList(),
                        null,
                        cancellationToken
                    )
                    .ConfigureAwait(false);
                return pager;
            })
            .ConfigureAwait(false);
    }

    /// <example><code>
    /// await client.InlineUsers.InlineUsers.ListWithOffsetStepPaginationAsync(
    ///     new SeedPagination.InlineUsers.ListUsersOffsetStepPaginationRequest
    ///     {
    ///         Page = 1,
    ///         Limit = 1,
    ///         Order = SeedPagination.InlineUsers.Order.Asc,
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
                        response => response.Data.Users_?.ToList(),
                        null,
                        cancellationToken
                    )
                    .ConfigureAwait(false);
                return pager;
            })
            .ConfigureAwait(false);
    }

    /// <example><code>
    /// await client.InlineUsers.InlineUsers.ListWithOffsetPaginationHasNextPageAsync(
    ///     new SeedPagination.InlineUsers.ListWithOffsetPaginationHasNextPageRequest
    ///     {
    ///         Page = 1,
    ///         Limit = 1,
    ///         Order = SeedPagination.InlineUsers.Order.Asc,
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
                        response => response.Data.Users_?.ToList(),
                        response => response.HasNextPage,
                        cancellationToken
                    )
                    .ConfigureAwait(false);
                return pager;
            })
            .ConfigureAwait(false);
    }

    /// <example><code>
    /// await client.InlineUsers.InlineUsers.ListWithExtendedResultsAsync(
    ///     new SeedPagination.InlineUsers.ListUsersExtendedRequest
    ///     {
    ///         Cursor = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ///     }
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
    /// await client.InlineUsers.InlineUsers.ListWithExtendedResultsAndOptionalDataAsync(
    ///     new SeedPagination.InlineUsers.ListUsersExtendedRequestForOptionalData
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
    /// await client.InlineUsers.InlineUsers.ListUsernamesAsync(
    ///     new SeedPagination.InlineUsers.ListUsernamesRequest { StartingAfter = "starting_after" }
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
    /// await client.InlineUsers.InlineUsers.ListWithGlobalConfigAsync(
    ///     new SeedPagination.InlineUsers.ListWithGlobalConfigRequest { Offset = 1 }
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
}
