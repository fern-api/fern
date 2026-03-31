using global::System.Text.Json;
using SeedExhaustive;
using SeedExhaustive.Core;
using SeedExhaustive.Types;

namespace SeedExhaustive.Endpoints;

public partial class PaginationClient : IPaginationClient
{
    private readonly RawClient _client;

    internal PaginationClient(RawClient client)
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

    /// <summary>
    /// List items with cursor pagination
    /// </summary>
    private WithRawResponseTask<PaginatedResponse> ListItemsInternalAsync(
        ListItemsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<PaginatedResponse>(
            ListItemsInternalAsyncCore(request, options, cancellationToken)
        );
    }

    private async Task<WithRawResponse<PaginatedResponse>> ListItemsInternalAsyncCore(
        ListItemsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var _queryString = new SeedExhaustive.Core.QueryStringBuilder.Builder(capacity: 2)
                    .Add("cursor", request.Cursor)
                    .Add("limit", request.Limit)
                    .MergeAdditional(options?.AdditionalQueryParameters)
                    .Build();
                var _headers = await new SeedExhaustive.Core.HeadersBuilder.Builder()
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
                            Path = "/pagination",
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
                        var responseData = JsonUtils.Deserialize<PaginatedResponse>(responseBody)!;
                        return new WithRawResponse<PaginatedResponse>()
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
                        throw new SeedExhaustiveApiException(
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
                    throw new SeedExhaustiveApiException(
                        $"Error with status code {response.StatusCode}",
                        response.StatusCode,
                        responseBody
                    );
                }
            })
            .ConfigureAwait(false);
    }

    /// <summary>
    /// List items with cursor pagination
    /// </summary>
    /// <example><code>
    /// await client.Endpoints.Pagination.ListItemsAsync(
    ///     new ListItemsRequest { Cursor = "cursor", Limit = 1 }
    /// );
    /// </code></example>
    public async Task<Pager<ObjectWithRequiredField>> ListItemsAsync(
        ListItemsRequest request,
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
                    ListItemsRequest,
                    RequestOptions?,
                    PaginatedResponse,
                    string?,
                    ObjectWithRequiredField
                >
                    .CreateInstanceAsync(
                        request,
                        options,
                        async (request, options, cancellationToken) =>
                            await ListItemsInternalAsync(request, options, cancellationToken),
                        (request, cursor) =>
                        {
                            request.Cursor = cursor;
                        },
                        response => response.Next,
                        response => response.Items?.ToList(),
                        cancellationToken
                    )
                    .ConfigureAwait(false);
                return pager;
            })
            .ConfigureAwait(false);
    }
}
