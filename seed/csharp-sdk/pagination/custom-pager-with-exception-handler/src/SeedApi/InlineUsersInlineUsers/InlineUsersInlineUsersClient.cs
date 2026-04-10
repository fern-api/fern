using global::System.Text.Json;
using SeedApi.Core;

namespace SeedApi;

public partial class InlineUsersInlineUsersClient : IInlineUsersInlineUsersClient
{
    private readonly RawClient _client;

    internal InlineUsersInlineUsersClient(RawClient client)
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

    private async Task<
        WithRawResponse<InlineUsersListUsersPaginationResponse>
    > InlineUsersInlineUsersListWithCursorPaginationAsyncCore(
        InlineUsersInlineUsersListWithCursorPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var _queryString = new SeedApi.Core.QueryStringBuilder.Builder(capacity: 4)
                    .Add("page", request.Page)
                    .Add("per_page", request.PerPage)
                    .Add("order", request.Order)
                    .Add("starting_after", request.StartingAfter)
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
                            Path = "inline-users/cursor",
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
                        var responseData =
                            JsonUtils.Deserialize<InlineUsersListUsersPaginationResponse>(
                                responseBody
                            )!;
                        return new WithRawResponse<InlineUsersListUsersPaginationResponse>()
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
            })
            .ConfigureAwait(false);
    }

    private async Task<
        WithRawResponse<InlineUsersListUsersMixedTypePaginationResponse>
    > InlineUsersInlineUsersListWithMixedTypeCursorPaginationAsyncCore(
        InlineUsersInlineUsersListWithMixedTypeCursorPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var _queryString = new SeedApi.Core.QueryStringBuilder.Builder(capacity: 1)
                    .Add("cursor", request.Cursor)
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
                            Method = HttpMethod.Post,
                            Path = "inline-users/mixed-type-cursor",
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
                        var responseData =
                            JsonUtils.Deserialize<InlineUsersListUsersMixedTypePaginationResponse>(
                                responseBody
                            )!;
                        return new WithRawResponse<InlineUsersListUsersMixedTypePaginationResponse>()
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
            })
            .ConfigureAwait(false);
    }

    private async Task<
        WithRawResponse<InlineUsersListUsersPaginationResponse>
    > InlineUsersInlineUsersListWithBodyCursorPaginationAsyncCore(
        InlineUsersInlineUsersListWithBodyCursorPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
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
                            Path = "inline-users/body-cursor",
                            Body = request,
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
                        var responseData =
                            JsonUtils.Deserialize<InlineUsersListUsersPaginationResponse>(
                                responseBody
                            )!;
                        return new WithRawResponse<InlineUsersListUsersPaginationResponse>()
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
            })
            .ConfigureAwait(false);
    }

    private async Task<
        WithRawResponse<InlineUsersListUsersPaginationResponse>
    > InlineUsersInlineUsersListWithOffsetPaginationAsyncCore(
        InlineUsersInlineUsersListWithOffsetPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var _queryString = new SeedApi.Core.QueryStringBuilder.Builder(capacity: 4)
                    .Add("page", request.Page)
                    .Add("per_page", request.PerPage)
                    .Add("order", request.Order)
                    .Add("starting_after", request.StartingAfter)
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
                            Path = "inline-users/offset",
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
                        var responseData =
                            JsonUtils.Deserialize<InlineUsersListUsersPaginationResponse>(
                                responseBody
                            )!;
                        return new WithRawResponse<InlineUsersListUsersPaginationResponse>()
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
            })
            .ConfigureAwait(false);
    }

    private async Task<
        WithRawResponse<InlineUsersListUsersPaginationResponse>
    > InlineUsersInlineUsersListWithDoubleOffsetPaginationAsyncCore(
        InlineUsersInlineUsersListWithDoubleOffsetPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var _queryString = new SeedApi.Core.QueryStringBuilder.Builder(capacity: 4)
                    .Add("page", request.Page)
                    .Add("per_page", request.PerPage)
                    .Add("order", request.Order)
                    .Add("starting_after", request.StartingAfter)
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
                            Path = "inline-users/double-offset",
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
                        var responseData =
                            JsonUtils.Deserialize<InlineUsersListUsersPaginationResponse>(
                                responseBody
                            )!;
                        return new WithRawResponse<InlineUsersListUsersPaginationResponse>()
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
            })
            .ConfigureAwait(false);
    }

    private async Task<
        WithRawResponse<InlineUsersListUsersPaginationResponse>
    > InlineUsersInlineUsersListWithBodyOffsetPaginationAsyncCore(
        InlineUsersInlineUsersListWithBodyOffsetPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
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
                            Path = "inline-users/body-offset",
                            Body = request,
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
                        var responseData =
                            JsonUtils.Deserialize<InlineUsersListUsersPaginationResponse>(
                                responseBody
                            )!;
                        return new WithRawResponse<InlineUsersListUsersPaginationResponse>()
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
            })
            .ConfigureAwait(false);
    }

    private async Task<
        WithRawResponse<InlineUsersListUsersPaginationResponse>
    > InlineUsersInlineUsersListWithOffsetStepPaginationAsyncCore(
        InlineUsersInlineUsersListWithOffsetStepPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var _queryString = new SeedApi.Core.QueryStringBuilder.Builder(capacity: 3)
                    .Add("page", request.Page)
                    .Add("limit", request.Limit)
                    .Add("order", request.Order)
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
                            Path = "inline-users/offset-step",
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
                        var responseData =
                            JsonUtils.Deserialize<InlineUsersListUsersPaginationResponse>(
                                responseBody
                            )!;
                        return new WithRawResponse<InlineUsersListUsersPaginationResponse>()
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
            })
            .ConfigureAwait(false);
    }

    private async Task<
        WithRawResponse<InlineUsersListUsersPaginationResponse>
    > InlineUsersInlineUsersListWithOffsetPaginationHasNextPageAsyncCore(
        InlineUsersInlineUsersListWithOffsetPaginationHasNextPageRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var _queryString = new SeedApi.Core.QueryStringBuilder.Builder(capacity: 3)
                    .Add("page", request.Page)
                    .Add("limit", request.Limit)
                    .Add("order", request.Order)
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
                            Path = "inline-users/offset-has-next-page",
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
                        var responseData =
                            JsonUtils.Deserialize<InlineUsersListUsersPaginationResponse>(
                                responseBody
                            )!;
                        return new WithRawResponse<InlineUsersListUsersPaginationResponse>()
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
            })
            .ConfigureAwait(false);
    }

    private async Task<
        WithRawResponse<InlineUsersListUsersExtendedResponse>
    > InlineUsersInlineUsersListWithExtendedResultsAsyncCore(
        InlineUsersInlineUsersListWithExtendedResultsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var _queryString = new SeedApi.Core.QueryStringBuilder.Builder(capacity: 1)
                    .Add("cursor", request.Cursor)
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
                            Path = "inline-users/extended",
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
                        var responseData =
                            JsonUtils.Deserialize<InlineUsersListUsersExtendedResponse>(
                                responseBody
                            )!;
                        return new WithRawResponse<InlineUsersListUsersExtendedResponse>()
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
            })
            .ConfigureAwait(false);
    }

    private async Task<
        WithRawResponse<InlineUsersListUsersExtendedOptionalListResponse>
    > InlineUsersInlineUsersListWithExtendedResultsAndOptionalDataAsyncCore(
        InlineUsersInlineUsersListWithExtendedResultsAndOptionalDataRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var _queryString = new SeedApi.Core.QueryStringBuilder.Builder(capacity: 1)
                    .Add("cursor", request.Cursor)
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
                            Path = "inline-users/extended-optional",
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
                        var responseData =
                            JsonUtils.Deserialize<InlineUsersListUsersExtendedOptionalListResponse>(
                                responseBody
                            )!;
                        return new WithRawResponse<InlineUsersListUsersExtendedOptionalListResponse>()
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
            })
            .ConfigureAwait(false);
    }

    private async Task<
        WithRawResponse<UsernameCursor>
    > InlineUsersInlineUsersListUsernamesAsyncCore(
        InlineUsersInlineUsersListUsernamesRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var _queryString = new SeedApi.Core.QueryStringBuilder.Builder(capacity: 1)
                    .Add("starting_after", request.StartingAfter)
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
                            Path = "inline-users/usernames",
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
            })
            .ConfigureAwait(false);
    }

    private async Task<
        WithRawResponse<InlineUsersUsernameContainer>
    > InlineUsersInlineUsersListWithGlobalConfigAsyncCore(
        InlineUsersInlineUsersListWithGlobalConfigRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var _queryString = new SeedApi.Core.QueryStringBuilder.Builder(capacity: 1)
                    .Add("offset", request.Offset)
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
                            Path = "inline-users/global-config",
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
                        var responseData = JsonUtils.Deserialize<InlineUsersUsernameContainer>(
                            responseBody
                        )!;
                        return new WithRawResponse<InlineUsersUsernameContainer>()
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
            })
            .ConfigureAwait(false);
    }

    /// <example><code>
    /// await client.InlineUsersInlineUsers.InlineUsersInlineUsersListWithCursorPaginationAsync(
    ///     new InlineUsersInlineUsersListWithCursorPaginationRequest()
    /// );
    /// </code></example>
    public WithRawResponseTask<InlineUsersListUsersPaginationResponse> InlineUsersInlineUsersListWithCursorPaginationAsync(
        InlineUsersInlineUsersListWithCursorPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<InlineUsersListUsersPaginationResponse>(
            InlineUsersInlineUsersListWithCursorPaginationAsyncCore(
                request,
                options,
                cancellationToken
            )
        );
    }

    /// <example><code>
    /// await client.InlineUsersInlineUsers.InlineUsersInlineUsersListWithMixedTypeCursorPaginationAsync(
    ///     new InlineUsersInlineUsersListWithMixedTypeCursorPaginationRequest()
    /// );
    /// </code></example>
    public WithRawResponseTask<InlineUsersListUsersMixedTypePaginationResponse> InlineUsersInlineUsersListWithMixedTypeCursorPaginationAsync(
        InlineUsersInlineUsersListWithMixedTypeCursorPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<InlineUsersListUsersMixedTypePaginationResponse>(
            InlineUsersInlineUsersListWithMixedTypeCursorPaginationAsyncCore(
                request,
                options,
                cancellationToken
            )
        );
    }

    /// <example><code>
    /// await client.InlineUsersInlineUsers.InlineUsersInlineUsersListWithBodyCursorPaginationAsync(
    ///     new InlineUsersInlineUsersListWithBodyCursorPaginationRequest()
    /// );
    /// </code></example>
    public WithRawResponseTask<InlineUsersListUsersPaginationResponse> InlineUsersInlineUsersListWithBodyCursorPaginationAsync(
        InlineUsersInlineUsersListWithBodyCursorPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<InlineUsersListUsersPaginationResponse>(
            InlineUsersInlineUsersListWithBodyCursorPaginationAsyncCore(
                request,
                options,
                cancellationToken
            )
        );
    }

    /// <example><code>
    /// await client.InlineUsersInlineUsers.InlineUsersInlineUsersListWithOffsetPaginationAsync(
    ///     new InlineUsersInlineUsersListWithOffsetPaginationRequest()
    /// );
    /// </code></example>
    public WithRawResponseTask<InlineUsersListUsersPaginationResponse> InlineUsersInlineUsersListWithOffsetPaginationAsync(
        InlineUsersInlineUsersListWithOffsetPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<InlineUsersListUsersPaginationResponse>(
            InlineUsersInlineUsersListWithOffsetPaginationAsyncCore(
                request,
                options,
                cancellationToken
            )
        );
    }

    /// <example><code>
    /// await client.InlineUsersInlineUsers.InlineUsersInlineUsersListWithDoubleOffsetPaginationAsync(
    ///     new InlineUsersInlineUsersListWithDoubleOffsetPaginationRequest()
    /// );
    /// </code></example>
    public WithRawResponseTask<InlineUsersListUsersPaginationResponse> InlineUsersInlineUsersListWithDoubleOffsetPaginationAsync(
        InlineUsersInlineUsersListWithDoubleOffsetPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<InlineUsersListUsersPaginationResponse>(
            InlineUsersInlineUsersListWithDoubleOffsetPaginationAsyncCore(
                request,
                options,
                cancellationToken
            )
        );
    }

    /// <example><code>
    /// await client.InlineUsersInlineUsers.InlineUsersInlineUsersListWithBodyOffsetPaginationAsync(
    ///     new InlineUsersInlineUsersListWithBodyOffsetPaginationRequest()
    /// );
    /// </code></example>
    public WithRawResponseTask<InlineUsersListUsersPaginationResponse> InlineUsersInlineUsersListWithBodyOffsetPaginationAsync(
        InlineUsersInlineUsersListWithBodyOffsetPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<InlineUsersListUsersPaginationResponse>(
            InlineUsersInlineUsersListWithBodyOffsetPaginationAsyncCore(
                request,
                options,
                cancellationToken
            )
        );
    }

    /// <example><code>
    /// await client.InlineUsersInlineUsers.InlineUsersInlineUsersListWithOffsetStepPaginationAsync(
    ///     new InlineUsersInlineUsersListWithOffsetStepPaginationRequest()
    /// );
    /// </code></example>
    public WithRawResponseTask<InlineUsersListUsersPaginationResponse> InlineUsersInlineUsersListWithOffsetStepPaginationAsync(
        InlineUsersInlineUsersListWithOffsetStepPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<InlineUsersListUsersPaginationResponse>(
            InlineUsersInlineUsersListWithOffsetStepPaginationAsyncCore(
                request,
                options,
                cancellationToken
            )
        );
    }

    /// <example><code>
    /// await client.InlineUsersInlineUsers.InlineUsersInlineUsersListWithOffsetPaginationHasNextPageAsync(
    ///     new InlineUsersInlineUsersListWithOffsetPaginationHasNextPageRequest()
    /// );
    /// </code></example>
    public WithRawResponseTask<InlineUsersListUsersPaginationResponse> InlineUsersInlineUsersListWithOffsetPaginationHasNextPageAsync(
        InlineUsersInlineUsersListWithOffsetPaginationHasNextPageRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<InlineUsersListUsersPaginationResponse>(
            InlineUsersInlineUsersListWithOffsetPaginationHasNextPageAsyncCore(
                request,
                options,
                cancellationToken
            )
        );
    }

    /// <example><code>
    /// await client.InlineUsersInlineUsers.InlineUsersInlineUsersListWithExtendedResultsAsync(
    ///     new InlineUsersInlineUsersListWithExtendedResultsRequest()
    /// );
    /// </code></example>
    public WithRawResponseTask<InlineUsersListUsersExtendedResponse> InlineUsersInlineUsersListWithExtendedResultsAsync(
        InlineUsersInlineUsersListWithExtendedResultsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<InlineUsersListUsersExtendedResponse>(
            InlineUsersInlineUsersListWithExtendedResultsAsyncCore(
                request,
                options,
                cancellationToken
            )
        );
    }

    /// <example><code>
    /// await client.InlineUsersInlineUsers.InlineUsersInlineUsersListWithExtendedResultsAndOptionalDataAsync(
    ///     new InlineUsersInlineUsersListWithExtendedResultsAndOptionalDataRequest()
    /// );
    /// </code></example>
    public WithRawResponseTask<InlineUsersListUsersExtendedOptionalListResponse> InlineUsersInlineUsersListWithExtendedResultsAndOptionalDataAsync(
        InlineUsersInlineUsersListWithExtendedResultsAndOptionalDataRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<InlineUsersListUsersExtendedOptionalListResponse>(
            InlineUsersInlineUsersListWithExtendedResultsAndOptionalDataAsyncCore(
                request,
                options,
                cancellationToken
            )
        );
    }

    /// <example><code>
    /// await client.InlineUsersInlineUsers.InlineUsersInlineUsersListUsernamesAsync(
    ///     new InlineUsersInlineUsersListUsernamesRequest()
    /// );
    /// </code></example>
    public WithRawResponseTask<UsernameCursor> InlineUsersInlineUsersListUsernamesAsync(
        InlineUsersInlineUsersListUsernamesRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<UsernameCursor>(
            InlineUsersInlineUsersListUsernamesAsyncCore(request, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.InlineUsersInlineUsers.InlineUsersInlineUsersListWithGlobalConfigAsync(
    ///     new InlineUsersInlineUsersListWithGlobalConfigRequest()
    /// );
    /// </code></example>
    public WithRawResponseTask<InlineUsersUsernameContainer> InlineUsersInlineUsersListWithGlobalConfigAsync(
        InlineUsersInlineUsersListWithGlobalConfigRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<InlineUsersUsernameContainer>(
            InlineUsersInlineUsersListWithGlobalConfigAsyncCore(request, options, cancellationToken)
        );
    }
}
