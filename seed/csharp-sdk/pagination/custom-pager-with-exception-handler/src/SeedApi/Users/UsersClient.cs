using global::System.Text.Json;
using SeedApi.Core;

namespace SeedApi;

public partial class UsersClient : IUsersClient
{
    private readonly RawClient _client;

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

    private async Task<
        WithRawResponse<ListUsersPaginationResponse>
    > ListwithcursorpaginationAsyncCore(
        UsersListWithCursorPaginationRequest request,
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
                            Path = "users/cursor",
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
        WithRawResponse<ListUsersMixedTypePaginationResponse>
    > ListwithmixedtypecursorpaginationAsyncCore(
        UsersListWithMixedTypeCursorPaginationRequest request,
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
                            Path = "users/mixed-type-cursor",
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
        WithRawResponse<ListUsersPaginationResponse>
    > ListwithbodycursorpaginationAsyncCore(
        UsersListWithBodyCursorPaginationRequest request,
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
                            Path = "users/body-cursor",
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
        WithRawResponse<ListUsersTopLevelCursorPaginationResponse>
    > ListwithtoplevelbodycursorpaginationAsyncCore(
        UsersListWithTopLevelBodyCursorPaginationRequest request,
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
                            Path = "users/top-level-cursor",
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
        WithRawResponse<ListUsersPaginationResponse>
    > ListwithoffsetpaginationAsyncCore(
        UsersListWithOffsetPaginationRequest request,
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
                            Path = "users/offset",
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
        WithRawResponse<ListUsersPaginationResponse>
    > ListwithdoubleoffsetpaginationAsyncCore(
        UsersListWithDoubleOffsetPaginationRequest request,
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
                            Path = "users/double-offset",
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
        WithRawResponse<ListUsersPaginationResponse>
    > ListwithbodyoffsetpaginationAsyncCore(
        UsersListWithBodyOffsetPaginationRequest request,
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
                            Path = "users/body-offset",
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
        WithRawResponse<ListUsersPaginationResponse>
    > ListwithoffsetsteppaginationAsyncCore(
        UsersListWithOffsetStepPaginationRequest request,
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
                            Path = "users/offset-step",
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
        WithRawResponse<ListUsersPaginationResponse>
    > ListwithoffsetpaginationhasnextpageAsyncCore(
        UsersListWithOffsetPaginationHasNextPageRequest request,
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
                            Path = "users/offset-has-next-page",
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

    private async Task<WithRawResponse<ListUsersExtendedResponse>> ListwithextendedresultsAsyncCore(
        UsersListWithExtendedResultsRequest request,
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
                            Path = "users/extended",
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
        WithRawResponse<ListUsersExtendedOptionalListResponse>
    > ListwithextendedresultsandoptionaldataAsyncCore(
        UsersListWithExtendedResultsAndOptionalDataRequest request,
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
                            Path = "users/extended-optional",
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

    private async Task<WithRawResponse<UsernameCursor>> ListusernamesAsyncCore(
        UsersListUsernamesRequest request,
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
                            Path = "users/usernames",
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

    private async Task<WithRawResponse<UsernameCursor>> ListusernameswithoptionalresponseAsyncCore(
        UsersListUsernamesWithOptionalResponseRequest request,
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
                            Path = "users/usernames-optional",
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

    private async Task<WithRawResponse<UsernameContainer>> ListwithglobalconfigAsyncCore(
        UsersListWithGlobalConfigRequest request,
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
                            Path = "users/global-config",
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
        WithRawResponse<ListUsersOptionalDataPaginationResponse>
    > ListwithoptionaldataAsyncCore(
        UsersListWithOptionalDataRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var _queryString = new SeedApi.Core.QueryStringBuilder.Builder(capacity: 1)
                    .Add("page", request.Page)
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
                            Path = "users/optional-data",
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
        WithRawResponse<ListUsersAliasedDataPaginationResponse>
    > ListwithaliaseddataAsyncCore(
        UsersListWithAliasedDataRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var _queryString = new SeedApi.Core.QueryStringBuilder.Builder(capacity: 3)
                    .Add("page", request.Page)
                    .Add("per_page", request.PerPage)
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
                            Path = "users/aliased-data",
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
                            JsonUtils.Deserialize<ListUsersAliasedDataPaginationResponse>(
                                responseBody
                            )!;
                        return new WithRawResponse<ListUsersAliasedDataPaginationResponse>()
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
    /// await client.Users.ListwithcursorpaginationAsync(new UsersListWithCursorPaginationRequest());
    /// </code></example>
    public WithRawResponseTask<ListUsersPaginationResponse> ListwithcursorpaginationAsync(
        UsersListWithCursorPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<ListUsersPaginationResponse>(
            ListwithcursorpaginationAsyncCore(request, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.Users.ListwithmixedtypecursorpaginationAsync(
    ///     new UsersListWithMixedTypeCursorPaginationRequest()
    /// );
    /// </code></example>
    public WithRawResponseTask<ListUsersMixedTypePaginationResponse> ListwithmixedtypecursorpaginationAsync(
        UsersListWithMixedTypeCursorPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<ListUsersMixedTypePaginationResponse>(
            ListwithmixedtypecursorpaginationAsyncCore(request, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.Users.ListwithbodycursorpaginationAsync(
    ///     new UsersListWithBodyCursorPaginationRequest()
    /// );
    /// </code></example>
    public WithRawResponseTask<ListUsersPaginationResponse> ListwithbodycursorpaginationAsync(
        UsersListWithBodyCursorPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<ListUsersPaginationResponse>(
            ListwithbodycursorpaginationAsyncCore(request, options, cancellationToken)
        );
    }

    /// <summary>
    /// Pagination endpoint with a top-level cursor field in the request body.
    /// This tests that the mock server correctly ignores cursor mismatches
    /// when getNextPage() is called with a different cursor value.
    /// </summary>
    /// <example><code>
    /// await client.Users.ListwithtoplevelbodycursorpaginationAsync(
    ///     new UsersListWithTopLevelBodyCursorPaginationRequest()
    /// );
    /// </code></example>
    public WithRawResponseTask<ListUsersTopLevelCursorPaginationResponse> ListwithtoplevelbodycursorpaginationAsync(
        UsersListWithTopLevelBodyCursorPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<ListUsersTopLevelCursorPaginationResponse>(
            ListwithtoplevelbodycursorpaginationAsyncCore(request, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.Users.ListwithoffsetpaginationAsync(new UsersListWithOffsetPaginationRequest());
    /// </code></example>
    public WithRawResponseTask<ListUsersPaginationResponse> ListwithoffsetpaginationAsync(
        UsersListWithOffsetPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<ListUsersPaginationResponse>(
            ListwithoffsetpaginationAsyncCore(request, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.Users.ListwithdoubleoffsetpaginationAsync(
    ///     new UsersListWithDoubleOffsetPaginationRequest()
    /// );
    /// </code></example>
    public WithRawResponseTask<ListUsersPaginationResponse> ListwithdoubleoffsetpaginationAsync(
        UsersListWithDoubleOffsetPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<ListUsersPaginationResponse>(
            ListwithdoubleoffsetpaginationAsyncCore(request, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.Users.ListwithbodyoffsetpaginationAsync(
    ///     new UsersListWithBodyOffsetPaginationRequest()
    /// );
    /// </code></example>
    public WithRawResponseTask<ListUsersPaginationResponse> ListwithbodyoffsetpaginationAsync(
        UsersListWithBodyOffsetPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<ListUsersPaginationResponse>(
            ListwithbodyoffsetpaginationAsyncCore(request, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.Users.ListwithoffsetsteppaginationAsync(
    ///     new UsersListWithOffsetStepPaginationRequest()
    /// );
    /// </code></example>
    public WithRawResponseTask<ListUsersPaginationResponse> ListwithoffsetsteppaginationAsync(
        UsersListWithOffsetStepPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<ListUsersPaginationResponse>(
            ListwithoffsetsteppaginationAsyncCore(request, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.Users.ListwithoffsetpaginationhasnextpageAsync(
    ///     new UsersListWithOffsetPaginationHasNextPageRequest()
    /// );
    /// </code></example>
    public WithRawResponseTask<ListUsersPaginationResponse> ListwithoffsetpaginationhasnextpageAsync(
        UsersListWithOffsetPaginationHasNextPageRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<ListUsersPaginationResponse>(
            ListwithoffsetpaginationhasnextpageAsyncCore(request, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.Users.ListwithextendedresultsAsync(new UsersListWithExtendedResultsRequest());
    /// </code></example>
    public WithRawResponseTask<ListUsersExtendedResponse> ListwithextendedresultsAsync(
        UsersListWithExtendedResultsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<ListUsersExtendedResponse>(
            ListwithextendedresultsAsyncCore(request, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.Users.ListwithextendedresultsandoptionaldataAsync(
    ///     new UsersListWithExtendedResultsAndOptionalDataRequest()
    /// );
    /// </code></example>
    public WithRawResponseTask<ListUsersExtendedOptionalListResponse> ListwithextendedresultsandoptionaldataAsync(
        UsersListWithExtendedResultsAndOptionalDataRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<ListUsersExtendedOptionalListResponse>(
            ListwithextendedresultsandoptionaldataAsyncCore(request, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.Users.ListusernamesAsync(new UsersListUsernamesRequest());
    /// </code></example>
    public WithRawResponseTask<UsernameCursor> ListusernamesAsync(
        UsersListUsernamesRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<UsernameCursor>(
            ListusernamesAsyncCore(request, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.Users.ListusernameswithoptionalresponseAsync(
    ///     new UsersListUsernamesWithOptionalResponseRequest()
    /// );
    /// </code></example>
    public WithRawResponseTask<UsernameCursor> ListusernameswithoptionalresponseAsync(
        UsersListUsernamesWithOptionalResponseRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<UsernameCursor>(
            ListusernameswithoptionalresponseAsyncCore(request, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.Users.ListwithglobalconfigAsync(new UsersListWithGlobalConfigRequest());
    /// </code></example>
    public WithRawResponseTask<UsernameContainer> ListwithglobalconfigAsync(
        UsersListWithGlobalConfigRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<UsernameContainer>(
            ListwithglobalconfigAsyncCore(request, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.Users.ListwithoptionaldataAsync(new UsersListWithOptionalDataRequest());
    /// </code></example>
    public WithRawResponseTask<ListUsersOptionalDataPaginationResponse> ListwithoptionaldataAsync(
        UsersListWithOptionalDataRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<ListUsersOptionalDataPaginationResponse>(
            ListwithoptionaldataAsyncCore(request, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.Users.ListwithaliaseddataAsync(new UsersListWithAliasedDataRequest());
    /// </code></example>
    public WithRawResponseTask<ListUsersAliasedDataPaginationResponse> ListwithaliaseddataAsync(
        UsersListWithAliasedDataRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<ListUsersAliasedDataPaginationResponse>(
            ListwithaliaseddataAsyncCore(request, options, cancellationToken)
        );
    }
}
