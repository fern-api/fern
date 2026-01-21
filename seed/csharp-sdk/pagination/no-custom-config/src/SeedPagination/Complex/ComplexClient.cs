using System.Text.Json;
using SeedPagination.Core;

namespace SeedPagination;

public partial class ComplexClient : IComplexClient
{
    private RawClient _client;

    internal ComplexClient(RawClient client)
    {
        _client = client;
    }

    private WithRawResponseTask<PaginatedConversationResponse> SearchInternalAsync(
        string index,
        SearchRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<PaginatedConversationResponse>(
            SearchInternalAsyncCore(index, request, options, cancellationToken)
        );
    }

    private async Task<WithRawResponse<PaginatedConversationResponse>> SearchInternalAsyncCore(
        string index,
        SearchRequest request,
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
                    Path = string.Format(
                        "{0}/conversations/search",
                        ValueConvert.ToPathParameterString(index)
                    ),
                    Body = request,
                    ContentType = "application/json",
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
                var responseData = JsonUtils.Deserialize<PaginatedConversationResponse>(
                    responseBody
                )!;
                return new WithRawResponse<PaginatedConversationResponse>()
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
    }

    /// <example><code>
    /// await client.Complex.SearchAsync(
    ///     "index",
    ///     new SearchRequest
    ///     {
    ///         Pagination = new StartingAfterPaging { PerPage = 1, StartingAfter = "starting_after" },
    ///         Query = new SingleFilterSearchRequest
    ///         {
    ///             Field = "field",
    ///             Operator = SingleFilterSearchRequestOperator.Equals_,
    ///             Value = "value",
    ///         },
    ///     }
    /// );
    /// </code></example>
    public async Task<Pager<Conversation>> SearchAsync(
        string index,
        SearchRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        if (request is not null)
        {
            request = request with { };
        }
        var pager = await CursorPager<
            SearchRequest,
            RequestOptions?,
            PaginatedConversationResponse,
            string?,
            Conversation
        >
            .CreateInstanceAsync(
                request,
                options,
                async (request, options, cancellationToken) =>
                    await SearchInternalAsync(index, request, options, cancellationToken)
                        .ConfigureAwait(false),
                (request, cursor) =>
                {
                    request.Pagination ??= new StartingAfterPaging() { PerPage = 0 };
                    request.Pagination.StartingAfter = cursor;
                },
                response => response.Pages?.Next?.StartingAfter,
                response => response.Conversations?.ToList(),
                cancellationToken
            )
            .ConfigureAwait(false);
        return pager;
    }
}
